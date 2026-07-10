'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';
import { Product } from '@/lib/types';

interface WishlistDrawerProps {
  onProductSelect?: (product: Product) => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onProductSelect }) => {
  const { wishlist, isWishlistOpen, closeWishlist, toggleWishlist, addToCart } = useShop();

  const handleMoveToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
    toggleWishlist(product);
  };

  const handleViewDetails = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
      closeWishlist();
    }
  };

  return (
    <Drawer isOpen={isWishlistOpen} onClose={closeWishlist} title="My Wishlist">
      {wishlist.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/10 rounded-full flex items-center justify-center text-brand-pink">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
          <Button variant="outline" onClick={closeWishlist} className="mt-4">Discover Scents</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-dark-card/50 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-4 group cursor-pointer hover:border-brand-pink/30 transition-all"
              onClick={() => handleViewDetails(item)}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-lg overflow-hidden border border-gray-100 dark:border-white/5 flex-shrink-0 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-brand-pink/0 group-hover:bg-brand-pink/5 transition-colors"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-brand-pink transition-colors">{item.name}</h3>
                  <p className="text-sm text-brand-pink font-medium">₵{item.price.toLocaleString()}</p>
                  <div className="flex text-yellow-400 text-xs mt-1">
                    {'★'.repeat(Math.floor(item.rating))}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-bold uppercase tracking-tighter">Click to reveal details</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                  className="text-brand-pink hover:text-red-500 self-start p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
              <Button
                variant="outline"
                className="w-full text-sm py-2 hover:bg-brand-pink hover:text-white hover:border-brand-pink"
                onClick={(e) => handleMoveToCart(e, item)}
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

export default WishlistDrawer;
