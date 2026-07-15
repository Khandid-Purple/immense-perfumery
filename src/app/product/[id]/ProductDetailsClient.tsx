'use client';

import ProductDetails from '@/components/ProductDetails';
import { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAppNavigate, useProductSelect } from '@/lib/navigation';

export default function ProductDetailsClient({ product }: { product: Product }) {
  const router = useRouter();
  const onNavigate = useAppNavigate();
  const onProductSelect = useProductSelect();

  return (
    <ProductDetails
      product={product}
      onBack={() => router.push('/')}
      onProductSelect={onProductSelect}
      onBuyNow={() => onNavigate('checkout')}
    />
  );
}
