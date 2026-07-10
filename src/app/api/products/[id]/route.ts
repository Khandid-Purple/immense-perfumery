import { eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiRole, withRoute, json, parseBody, ApiError } from '@/server/api';
import { toClientProduct } from '@/server/products';
import { z } from 'zod';

const productInput = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  image: z.string().min(1),
  images: z.array(z.string()).default([]),
  description: z.string().min(1),
  notes: z.array(z.string()).optional(),
  stock: z.number().int().min(0),
}).partial();

export const GET = withRoute(async (_req, { params }) => {
  const { id } = await params;
  const [row] = await db.select().from(schema.product).where(eq(schema.product.id, id));
  if (!row) throw new ApiError('Product not found', 404, 'NOT_FOUND');
  const reviews = await db.select().from(schema.review).where(eq(schema.review.productId, id));
  return json(toClientProduct(row, reviews));
});

export const PATCH = withRoute(async (req, { params }) => {
  await requireApiRole('admin');
  const { id } = await params;
  const { price, ...rest } = await parseBody(req, productInput);
  const [row] = await db.update(schema.product).set({
    ...rest,
    ...(price !== undefined ? { price: String(price) } : {}),
  }).where(eq(schema.product.id, id)).returning();
  if (!row) throw new ApiError('Product not found', 404, 'NOT_FOUND');
  return json(toClientProduct(row));
});

export const DELETE = withRoute(async (_req, { params }) => {
  await requireApiRole('admin');
  const { id } = await params;
  await db.delete(schema.product).where(eq(schema.product.id, id));
  return json({ ok: true });
});
