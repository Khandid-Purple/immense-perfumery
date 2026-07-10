// ─────────────────────────────────────────────────────────────
// Immense Perfumery — Drizzle schema.
//
// Single-vendor storefront: no seller/marketplace concept anywhere.
//
// FK decision table (mirrors the Confidence/Nabi convention):
//  • child meaningless without parent (cart line, wishlist line,
//    order line, saved address) → onDelete: 'cascade'
//  • receipt-like child must survive parent deletion (order,
//    review, inquiry — accounting/history rows) → nullable FK +
//    'set null' + snapshot columns for the data that mattered
//
// Money: numeric(12,2), handled as string in Drizzle.
// IDs: readable prefixes via $defaultFn, except Better Auth core
//      tables (Better Auth generates its own ids) and the 22 seed
//      products (kept as their literal '1'..'22' string ids).
// ─────────────────────────────────────────────────────────────
import {
  pgTable, text, integer, boolean, timestamp, numeric, jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const rid = () => globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 18);
const id = (prefix: string) => text('id').primaryKey().$defaultFn(() => `${prefix}_${rid()}`);
const now = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

// ── Better Auth core ──────────────────────────────────────────
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').$type<'customer' | 'admin'>().default('customer').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Catalog ───────────────────────────────────────────────────
export const product = pgTable('product', {
  id: text('id').primaryKey().$defaultFn(() => `prod_${rid()}`),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0').notNull(),
  reviewCount: integer('review_count').default(0).notNull(),
  image: text('image').notNull(),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  description: text('description').notNull(),
  notes: jsonb('notes').$type<string[]>(),
  stock: integer('stock').default(0).notNull(),
  createdAt: now(),
});

export const review = pgTable('review', {
  id: id('rev'),
  productId: text('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  isVerified: boolean('is_verified').default(true).notNull(),
  createdAt: now(),
});

// ── Customer data ─────────────────────────────────────────────
export const address = pgTable('address', {
  id: id('addr'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  street: text('street').notNull(),
  digitalAddress: text('digital_address'),
  region: text('region').notNull(),
  city: text('city').notNull(),
  zip: text('zip'),
  phone: text('phone').notNull(),
  createdAt: now(),
});

export const cartItem = pgTable('cart_item', {
  id: id('ci'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(1).notNull(),
  createdAt: now(),
}, (t) => [uniqueIndex('cart_item_user_product_idx').on(t.userId, t.productId)]);

export const wishlistItem = pgTable('wishlist_item', {
  id: id('wi'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  createdAt: now(),
}, (t) => [uniqueIndex('wishlist_item_user_product_idx').on(t.userId, t.productId)]);

// ── Orders ────────────────────────────────────────────────────
export const order = pgTable('order', {
  id: id('ord'),
  buyerId: text('buyer_id').references(() => user.id, { onDelete: 'set null' }),
  itemSubtotal: numeric('item_subtotal', { precision: 12, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 12, scale: 2 }).default('0').notNull(),
  promoCode: text('promo_code'),
  giftWrap: boolean('gift_wrap').default(false).notNull(),
  giftWrapCost: numeric('gift_wrap_cost', { precision: 12, scale: 2 }).default('0').notNull(),
  orderNote: text('order_note'),
  shippingMethod: text('shipping_method').notNull(),
  shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).default('0').notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  status: text('status').$type<'Order Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>().default('Order Confirmed').notNull(),
  paymentStatus: text('payment_status').$type<'unpaid' | 'paid' | 'refunded'>().default('unpaid').notNull(),
  paystackRef: text('paystack_ref').notNull().unique(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  shippingAddress: jsonb('shipping_address').$type<{
    firstName: string; lastName: string; street: string; digitalAddress?: string;
    region: string; city: string; zip?: string; phone: string;
  }>().notNull(),
  cancelReason: text('cancel_reason'),
  createdAt: now(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItem = pgTable('order_item', {
  id: id('oi'),
  orderId: text('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => product.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  imageUrl: text('image_url'),
  category: text('category'),
});

// ── Store config ──────────────────────────────────────────────
export const promo = pgTable('promo', {
  code: text('code').primaryKey(),
  discountPercent: integer('discount_percent').notNull(),
  createdAt: now(),
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey().default('settings'),
  heroProductId: text('hero_product_id'),
  freeShippingThreshold: numeric('free_shipping_threshold', { precision: 12, scale: 2 }).default('3000').notNull(),
  standardShippingRate: numeric('standard_shipping_rate', { precision: 12, scale: 2 }).default('45').notNull(),
  expressShippingRate: numeric('express_shipping_rate', { precision: 12, scale: 2 }).default('80').notNull(),
  giftWrapRate: numeric('gift_wrap_rate', { precision: 12, scale: 2 }).default('25').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Contact / wholesale / newsletter inbox ────────────────────
export const inquiry = pgTable('inquiry', {
  id: id('inq'),
  type: text('type').$type<'contact' | 'wholesale' | 'newsletter'>().notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  name: text('name'),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  subject: text('subject'),
  message: text('message'),
  volumeRange: text('volume_range'),
  status: text('status').$type<'new' | 'read' | 'archived'>().default('new').notNull(),
  createdAt: now(),
});
