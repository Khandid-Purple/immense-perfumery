'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/lib/types';

interface RecentlyViewedProps {
  onProductSelect: (product: Product) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductSelect }) => {
  const { recentlyViewedIds, products } = useShop();

  const viewedProducts = recentlyViewedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-16 w-full max-w-7xl mx-auto px-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-brand-pink font-semibold uppercase tracking-wider text-[10px] mb-1">Your Journey</h3>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
        {viewedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="flex-shrink-0 w-48 group cursor-pointer"
          >
            <div className="relative aspect-[4/5] bg-white dark:bg-dark-card rounded-2xl p-4 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-sm group-hover:shadow-md transition-all">
              <img
                src={product.image}
                alt={product.name}
                className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-brand-pink/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-brand-pink transition-colors">{product.name}</h4>
              <p className="text-[10px] text-gray-500 font-bold">₵{product.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
