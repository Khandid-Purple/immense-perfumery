import { desc } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiRole, withRoute, json, parseBody } from '@/server/api';
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
});

export const GET = withRoute(async () => {
  const rows = await db.select().from(schema.product).orderBy(desc(schema.product.createdAt));
  return json(rows.map((r) => toClientProduct(r)));
});

export const POST = withRoute(async (req) => {
  await requireApiRole('admin');
  const data = await parseBody(req, productInput);
  const [row] = await db.insert(schema.product).values({
    ...data,
    price: String(data.price),
  }).returning();
  return json(toClientProduct(row), 201);
});
