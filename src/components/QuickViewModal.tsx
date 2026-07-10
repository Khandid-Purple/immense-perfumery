'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/context/ToastContext';
import { Button } from './ui/Button';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewDetails: (product: Product) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onViewDetails }) => {
  const { addToCart } = useShop();
  const { showToast } = useToast();

  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const success = addToCart(product);
    if (success) {
      showToast(`Added ${product.name} to bag`);
      onClose();
    } else {
      showToast('Max stock limit reached', 'info');
    }
  };

  const handleViewDetails = () => {
    onViewDetails(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl overflow-hidden animate-pop border border-white/20 dark:border-white/10 flex flex-col max-h-[90dvh]">

        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white dark:bg-dark-card z-30 shrink-0">
          <div>
            <span className="text-brand-pink text-[10px] font-bold uppercase tracking-widest block mb-1">
              {product.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white rounded-full hover:bg-brand-pink hover:text-white transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row min-h-0">

          <div className="w-full md:w-[45%] bg-pink-50 dark:bg-pink-900/10 p-6 flex items-center justify-center relative min-h-[240px] md:min-h-0">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full max-h-[200px] md:max-h-[350px] object-contain drop-shadow-2xl relative z-10 transition-transform duration-700 hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                 <div className="bg-black/70 text-white px-4 py-2 rounded-lg font-bold backdrop-blur-sm border border-white/10 text-sm uppercase tracking-widest">Out of Stock</div>
              </div>
            )}
          </div>

          <div className="w-full md:w-[55%] p-6 sm:p-8 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <div className="flex text-yellow-400 text-xs">
                    {'★'.repeat(Math.floor(product.rating))}
                    {product.rating % 1 !== 0 && <span>☆</span>}
                 </div>
                 <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">({product.reviews} REVIEWS)</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic border-l-2 border-brand-pink/20 pl-4">
                &ldquo;{product.description.length > 200 ? product.description.substring(0, 200) + '...' : product.description}&rdquo;
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Price</span>
                   <span className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
                     ₵{product.price.toLocaleString()}
                   </span>
                 </div>
                 <div className="text-right">
                   <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">Availability</span>
                   <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                     {isOutOfStock ? 'Currently Unavailable' : 'In Stock & Ready'}
                   </span>
                 </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Olfactory Highlights</p>
                 <div className="flex flex-wrap gap-2">
                   {product.notes?.slice(0, 5).map(note => (
                     <span key={note} className="text-[10px] bg-white dark:bg-white/10 px-2 py-1 rounded-md border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300">
                       {note}
                     </span>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-dark-card z-30 shrink-0">
           <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-[2] py-4 text-sm uppercase tracking-widest font-bold shadow-xl shadow-brand-pink/20"
              >
                {isOutOfStock ? 'Notify Me' : 'Add to Bag'}
              </Button>
              <Button
                variant="outline"
                onClick={handleViewDetails}
                className="flex-1 py-4 text-sm uppercase tracking-widest font-bold border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200"
              >
                Full Details
              </Button>
           </div>
           <button
              onClick={onClose}
              className="sm:hidden w-full text-[10px] text-gray-400 dark:text-gray-500 hover:text-brand-pink text-center font-bold transition-colors pt-4 uppercase tracking-tighter"
            >
              Close Preview
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
