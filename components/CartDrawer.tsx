
import React from 'react';
import { useShop } from '../context/ShopContext';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal, clearCart, clearDirectCheckout } = useShop();

  const handleCheckoutClick = () => {
    clearDirectCheckout();
    closeCart();
    onCheckout();
  };

  return (
    <Drawer 
      isOpen={isCartOpen} 
      onClose={closeCart} 
      title="Your Shopping Bag"
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#1a2332] text-white flex flex-col z-[110] animate-slide-in shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        {/* Accessible Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <h2 id="drawer-title" className="text-2xl font-serif font-bold">Your Shopping Bag</h2>
          <button 
            onClick={closeCart}
            aria-label="Close Shopping Bag"
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {cart.length > 0 && (
            <div className="flex justify-end">
              <button 
                onClick={clearCart}
                aria-label="Empty your entire shopping bag"
                className="text-xs text-brand-pink hover:text-brand-pink-light font-bold uppercase tracking-[0.2em] transition-colors focus:outline-none focus-visible:underline underline-offset-8"
              >
                Clear Bag
              </button>
            </div>
          )}
          
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-fade-in">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-brand-pink/50 mb-4 border border-white/10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <p className="text-gray-400 text-lg font-light tracking-wide">Your bag is currently empty.</p>
              <button onClick={closeCart} className="text-brand-pink font-bold uppercase tracking-widest text-sm hover:underline hover:text-white transition-colors pt-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-pink">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-8" role="list" aria-label="Products in bag">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-5 relative group bg-white/5 p-4 rounded-3xl border border-transparent hover:border-white/10 transition-all" role="listitem">
                  {/* Image with white background for pop */}
                  <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 p-3 shadow-2xl">
                    <img src={item.image} alt="" aria-hidden="true" className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-100 truncate pr-6 text-base tracking-tight">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from bag`}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 font-bold opacity-70">{item.category}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      {/* High-Contrast Quantity Selector */}
                      <div className="flex items-center bg-[#1e293b] rounded-xl border border-white/10 px-1 py-1 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="text-gray-400 hover:text-brand-pink w-8 h-8 flex items-center justify-center transition-all text-xl font-light focus:outline-none active:scale-90"
                          disabled={item.quantity <= 1}
                        >–</button>
                        <span className="text-xs font-bold w-7 text-center text-gray-100" aria-label={`Current quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="text-gray-400 hover:text-brand-pink w-8 h-8 flex items-center justify-center transition-all text-xl font-light focus:outline-none active:scale-90"
                        >+</button>
                      </div>
                      <span className="font-bold text-brand-pink text-lg" aria-label={`Price: ₵${item.price.toLocaleString()}`}>₵{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-8 bg-[#1a2332] border-t border-white/10 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
            {/* Live Subtotal Announcement */}
            <div className="flex items-center justify-between" aria-live="polite">
              <span className="text-gray-400 font-light tracking-wide">Subtotal</span>
              <span className="text-3xl font-serif font-bold text-white">₵{cartTotal.toLocaleString()}</span>
            </div>
            <div className="space-y-4">
              <Button onClick={handleCheckoutClick} className="w-full py-5 text-lg font-serif tracking-[0.25em] shadow-2xl shadow-brand-pink/20 hover:scale-[1.02] active:scale-95">
                CHECKOUT NOW
              </Button>
              <button 
                onClick={closeCart} 
                className="w-full text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-[0.2em] transition-all py-2 focus:outline-none focus-visible:underline underline-offset-4"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
