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
  return json(orders.map((o, i) => ({ ...o, items: items[i] })));
});

// POST (create order) lands in M3 alongside Paystack + pricing logic.
