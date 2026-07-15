import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db, schema } from '@/server/db';
import { toClientProduct } from '@/server/products';
import ProductDetailsClient from './ProductDetailsClient';

async function getProduct(id: string) {
  const [row] = await db.select().from(schema.product).where(eq(schema.product.id, id));
  if (!row) return null;
  const reviews = await db.select().from(schema.review).where(eq(schema.review.productId, id));
  return toClientProduct(row, reviews);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <ProductDetailsClient product={product} />;
}
