// ─────────────────────────────────────────────────────────────
// Seed — idempotent: clears app tables, then reseeds.
//  • 22 products + 2 promo codes + default settings row.
//  • admin@immense.com (admin123) and user@immense.com (user123)
//    created via Better Auth (real credentials), matching the
//    demo accounts the prototype's Login screen already advertises.
// ─────────────────────────────────────────────────────────────
import { sql } from 'drizzle-orm';
import { db } from './index';
import { auth } from '../auth';
import * as s from './schema';
import { SEED_PRODUCTS, SEED_PROMOS } from './seed-data';

const ADMIN_EMAIL = 'admin@immense.com';
const ADMIN_PASSWORD = 'admin123';
const CUSTOMER_EMAIL = 'user@immense.com';
const CUSTOMER_PASSWORD = 'user123';

export async function runSeed() {
  // 1. Wipe app data (children first, respecting FKs).
  await db.execute(sql`
    TRUNCATE TABLE
      inquiry, order_item, "order", review, wishlist_item, cart_item, address, promo, settings, product
    RESTART IDENTITY CASCADE;
  `);
  await db.execute(sql`DELETE FROM "session"`);
  await db.execute(sql`DELETE FROM "account"`);
  await db.execute(sql`DELETE FROM "user"`);

  // 2. Products (literal seed ids '1'..'22').
  await db.insert(s.product).values(SEED_PRODUCTS);

  // 3. Promo codes.
  await db.insert(s.promo).values(SEED_PROMOS);

  // 4. Default settings singleton (hero = Chanel No. 5).
  await db.insert(s.settings).values({ id: 'settings', heroProductId: '1' });

  // 5. Admin account — real Better Auth signup, then elevate role.
  await auth.api.signUpEmail({ body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Admin User' } });
  await db.update(s.user).set({ role: 'admin' }).where(sql`${s.user.email} = ${ADMIN_EMAIL}`);

  // 6. Demo customer account.
  await auth.api.signUpEmail({ body: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD, name: 'Jane Doe' } });
  const customer = await db.query.user.findFirst({ where: (u, { eq }) => eq(u.email, CUSTOMER_EMAIL) });
  if (customer) {
    await db.insert(s.address).values({
      userId: customer.id,
      label: 'Home',
      firstName: 'Jane',
      lastName: 'Doe',
      street: '123 Perfume Lane, ACP Estate',
      digitalAddress: 'GA-123-4567',
      region: 'Greater Accra',
      city: 'Accra',
      zip: '00233',
      phone: '0555551234',
    });
  }

  return { products: SEED_PRODUCTS.length, promos: SEED_PROMOS.length, admin: ADMIN_EMAIL, customer: CUSTOMER_EMAIL };
}
