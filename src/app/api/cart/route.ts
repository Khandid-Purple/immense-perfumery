import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiUser, withRoute, json, parseBody, ApiError } from '@/server/api';
import { toClientProduct } from '@/server/products';
import { z } from 'zod';

async function cartWithProducts(userId: string) {
  const rows = await db.select().from(schema.cartItem).where(eq(schema.cartItem.userId, userId));
  const products = await Promise.all(rows.map((r) => db.select().from(schema.product).where(eq(schema.product.id, r.productId))));
  return rows.map((r, i) => ({ ...toClientProduct(products[i][0]), quantity: r.quantity }));
}

export const GET = withRoute(async () => {
  const user = await requireApiUser();
  return json(await cartWithProducts(user.id));
});

const addInput = z.object({ productId: z.string(), quantity: z.number().int().min(1).default(1) });

export const POST = withRoute(async (req) => {
  const user = await requireApiUser();
  const { productId, quantity } = await parseBody(req, addInput);

  const [product] = await db.select().from(schema.product).where(eq(schema.product.id, productId));
  if (!product) throw new ApiError('Product not found', 404, 'NOT_FOUND');

  const [existing] = await db.select().from(schema.cartItem).where(and(eq(schema.cartItem.userId, user.id), eq(schema.cartItem.productId, productId)));
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > product.stock) throw new ApiError('Not enough stock available', 409, 'OUT_OF_STOCK');

  if (existing) {
    await db.update(schema.cartItem).set({ quantity: nextQty }).where(eq(schema.cartItem.id, existing.id));
  } else {
    await db.insert(schema.cartItem).values({ userId: user.id, productId, quantity });
  }
  return json(await cartWithProducts(user.id), 201);
});

const updateInput = z.object({ productId: z.string(), quantity: z.number().int() });

export const PATCH = withRoute(async (req) => {
  const user = await requireApiUser();
  const { productId, quantity } = await parseBody(req, updateInput);

  if (quantity < 1) {
    await db.delete(schema.cartItem).where(and(eq(schema.cartItem.userId, user.id), eq(schema.cartItem.productId, productId)));
    return json(await cartWithProducts(user.id));
  }

  const [product] = await db.select().from(schema.product).where(eq(schema.product.id, productId));
  if (!product) throw new ApiError('Product not found', 404, 'NOT_FOUND');
  if (quantity > product.stock) throw new ApiError('Not enough stock available', 409, 'OUT_OF_STOCK');

  await db.update(schema.cartItem).set({ quantity }).where(and(eq(schema.cartItem.userId, user.id), eq(schema.cartItem.productId, productId)));
  return json(await cartWithProducts(user.id));
});

const removeInput = z.object({ productId: z.string().optional() });

export const DELETE = withRoute(async (req) => {
  const user = await requireApiUser();
  const { productId } = await parseBody(req, removeInput).catch(() => ({ productId: undefined }));
  if (productId) {
    await db.delete(schema.cartItem).where(and(eq(schema.cartItem.userId, user.id), eq(schema.cartItem.productId, productId)));
  } else {
    await db.delete(schema.cartItem).where(eq(schema.cartItem.userId, user.id));
  }
  return json(await cartWithProducts(user.id));
});
