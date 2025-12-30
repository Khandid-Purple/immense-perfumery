
import React from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

interface RecentlyViewedProps {
  onProductSelect: (product: Product) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductSelect }) => {
  const { recentlyViewedIds, products } = useShop();
  
  // Only show products that still exist in the current catalog
  const viewedProducts = recentlyViewedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-16 w-full max-w-7xl mx-auto px-6 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-brand-pink font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-brand-pink"></span>
            Your Journey
          </h3>
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6 mask-fade-edges">
        {viewedProducts.map((product, idx) => (
          <div 
            key={`${product.id}-${idx}`}
            onClick={() => onProductSelect(product)}
            className="flex-shrink-0 w-48 group cursor-pointer"
          >
            <div className="relative aspect-[4/5] bg-white dark:bg-dark-card rounded-[2rem] p-6 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Quick View Tag on hover */}
              <div className="absolute bottom-4 inset-x-4 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                 <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-[10px] font-bold text-center py-2 rounded-xl text-gray-800 dark:text-white border border-white/20 uppercase tracking-widest">
                   Explore
                 </div>
              </div>
            </div>
            <div className="mt-4 px-1">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-brand-pink transition-colors">{product.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-brand-pink font-bold">₵{product.price.toLocaleString()}</p>
                <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Eau de Parfum</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </section>
  );
};

export default RecentlyViewed;
