'use client';

import React, { useState } from 'react';
import Hero from '@/components/Hero';
import RecentlyViewed from '@/components/RecentlyViewed';
import ProductList from '@/components/ProductList';
import ImageAnalyzer from '@/components/ImageAnalyzer';
import QuickViewModal from '@/components/QuickViewModal';
import { Product } from '@/lib/types';
import { useAppNavigate, useProductSelect } from '@/lib/navigation';

export default function HomePage() {
  const onNavigate = useAppNavigate();
  const onProductSelect = useProductSelect();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="flex flex-col">
      <Hero onNavigate={onNavigate} onProductSelect={onProductSelect} />
      <RecentlyViewed onProductSelect={onProductSelect} />
      <ProductList onProductSelect={onProductSelect} onQuickView={setQuickViewProduct} />
      <ImageAnalyzer onProductSelect={onProductSelect} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onViewDetails={onProductSelect} />
    </div>
  );
}
