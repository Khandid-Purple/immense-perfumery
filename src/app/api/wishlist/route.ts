import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiUser, withRoute, json, parseBody, ApiError } from '@/server/api';
import { toClientProduct } from '@/server/products';
import { z } from 'zod';

async function wishlistWithProducts(userId: string) {
  const rows = await db.select().from(schema.wishlistItem).where(eq(schema.wishlistItem.userId, userId));
  const products = await Promise.all(rows.map((r) => db.select().from(schema.product).where(eq(schema.product.id, r.productId))));
  return products.map((p) => toClientProduct(p[0])).filter(Boolean);
}

export const GET = withRoute(async () => {
  const user = await requireApiUser();
  return json(await wishlistWithProducts(user.id));
});

const input = z.object({ productId: z.string() });

export const POST = withRoute(async (req) => {
  const user = await requireApiUser();
  const { productId } = await parseBody(req, input);
  const [product] = await db.select().from(schema.product).where(eq(schema.product.id, productId));
  if (!product) throw new ApiError('Product not found', 404, 'NOT_FOUND');
  await db.insert(schema.wishlistItem).values({ userId: user.id, productId }).onConflictDoNothing();
  return json(await wishlistWithProducts(user.id), 201);
});

export const DELETE = withRoute(async (req) => {
  const user = await requireApiUser();
  const { productId } = await parseBody(req, input);
  await db.delete(schema.wishlistItem).where(and(eq(schema.wishlistItem.userId, user.id), eq(schema.wishlistItem.productId, productId)));
  return json(await wishlistWithProducts(user.id));
});
