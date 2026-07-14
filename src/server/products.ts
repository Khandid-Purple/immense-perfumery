import type { schema } from './db';
import type { Product, Review } from '@/lib/types';

type ProductRow = typeof schema.product.$inferSelect;
type ReviewRow = typeof schema.review.$inferSelect;

// Convert a database review row into the client-facing Review shape.
// This ensures date formatting and type alignment with frontend expectations.
export function toClientReview(r: ReviewRow): Review {
  return {
    id: r.id,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt.toLocaleDateString(),
    isVerified: r.isVerified,
  };
}

// Convert a product row from the database into a client-friendly Product object.
// Optional customer reviews can be passed in and will be transformed as well.
export function toClientProduct(row: ProductRow, reviews?: ReviewRow[]): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    rating: Number(row.rating),
    reviews: row.reviewCount,
    image: row.image,
    images: row.images ?? [],
    description: row.description,
    notes: row.notes ?? undefined,
    stock: row.stock,
    customerReviews: reviews ? reviews.map(toClientReview) : undefined,
  };
}
