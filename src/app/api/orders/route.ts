import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiUser, withRoute, json } from '@/server/api';

export const GET = withRoute(async () => {
  const user = await requireApiUser();
  const orders = await db.select().from(schema.order)
    .where(eq(schema.order.buyerId, user.id))
    .orderBy(desc(schema.order.createdAt));
  const items = await Promise.all(
    orders.map((o) => db.select().from(schema.orderItem).where(eq(schema.orderItem.orderId, o.id)))
  );
  // Shaped to match the client `CartItem` type (extends Product) — `id` is the
  // product id, not the order-item row id, so hasPurchased checks (`item.id === product.id`)
  // and order-history rendering work without touching ProductDetails/Account.
  const toCartItem = (it: (typeof items)[number][number]) => ({
    id: it.productId,
    name: it.title,
    category: it.category ?? '',
    price: Number(it.price),
    rating: 0,
    reviews: 0,
    image: it.imageUrl ?? '',
    images: it.imageUrl ? [it.imageUrl] : [],
    description: '',
    stock: 0,
    quantity: it.quantity,
  });
  return json(orders.map((o, i) => ({ ...o, items: items[i].map(toCartItem) })));
});

// POST (create order) lands in M3 alongside Paystack + pricing logic.
