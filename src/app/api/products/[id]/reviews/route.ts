import { and, eq } from 'drizzle-orm';
import { db, schema, withTransaction } from '@/server/db';
import { requireApiUser, withRoute, json, parseBody, ApiError } from '@/server/api';
import { toClientProduct } from '@/server/products';
import { z } from 'zod';

const reviewInput = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export const POST = withRoute(async (req, { params }) => {
  const user = await requireApiUser();
  const { id: productId } = await params;
  const data = await parseBody(req, reviewInput);

  // Server-side purchase gate — never trust the client's claim.
  const paidOrders = await db.select({ id: schema.order.id })
    .from(schema.order)
    .where(and(eq(schema.order.buyerId, user.id), eq(schema.order.paymentStatus, 'paid')));
  if (paidOrders.length === 0) throw new ApiError('Only purchasers can review this fragrance.', 403, 'NOT_PURCHASED');

  const orderIds = paidOrders.map((o) => o.id);
  const purchasedThisProduct = await db.query.orderItem.findFirst({
    where: (oi, { eq: eqOp, and: andOp, inArray }) => andOp(eqOp(oi.productId, productId), inArray(oi.orderId, orderIds)),
  });
  if (!purchasedThisProduct) throw new ApiError('Only purchasers can review this fragrance.', 403, 'NOT_PURCHASED');

  const updated = await withTransaction(async (tx) => {
    await tx.insert(schema.review).values({
      productId,
      userId: user.id,
      userName: user.name,
      rating: data.rating,
      comment: data.comment,
      isVerified: true,
    });
    const allReviews = await tx.select().from(schema.review).where(eq(schema.review.productId, productId));
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    const [product] = await tx.update(schema.product)
      .set({ rating: avgRating.toFixed(2), reviewCount: allReviews.length })
      .where(eq(schema.product.id, productId))
      .returning();
    return toClientProduct(product, allReviews);
  });

  return json(updated, 201);
});
