
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
      // Note: Updated internal styles of Drawer.tsx to match if needed, but we can override here
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#1a2332] text-white flex flex-col z-[110] animate-slide-in">
        {/* Header Override for Navy Theme */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <h2 className="text-2xl font-serif font-bold">Your Shopping Bag</h2>
          <button 
            onClick={closeCart}
            aria-label="Close Shopping Bag"
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {cart.length > 0 && (
            <div className="flex justify-end">
              <button 
                onClick={clearCart}
                aria-label="Clear all items from bag"
                className="text-xs text-brand-pink hover:text-brand-pink-dark font-bold uppercase tracking-widest transition-colors focus:outline-none focus-visible:underline"
              >
                Clear Bag
              </button>
            </div>
          )}
          
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-brand-pink mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <p className="text-gray-400 text-lg font-light">Your bag is currently empty.</p>
              <button onClick={closeCart} className="text-brand-pink font-bold uppercase tracking-widest text-sm hover:underline pt-4">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-5 relative group">
                  <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 p-2 shadow-inner">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-100 truncate pr-6">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from bag`}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{item.category}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-[#1e293b] rounded-lg border border-white/10 px-1 py-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="text-gray-400 hover:text-brand-pink w-8 h-8 flex items-center justify-center transition-colors text-xl font-light"
                          disabled={item.quantity <= 1}
                        >–</button>
                        <span className="text-sm font-bold w-6 text-center text-gray-200">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="text-gray-400 hover:text-brand-pink w-8 h-8 flex items-center justify-center transition-colors text-xl font-light"
                        >+</button>
                      </div>
                      <span className="font-bold text-brand-pink text-lg">₵{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-8 bg-[#1a2332] border-t border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-light">Subtotal</span>
              <span className="text-3xl font-serif font-bold text-white">₵{cartTotal.toLocaleString()}</span>
            </div>
            <div className="space-y-4">
              <Button onClick={handleCheckoutClick} className="w-full py-5 text-lg font-serif tracking-[0.2em] shadow-2xl shadow-brand-pink/20">
                CHECKOUT NOW
              </Button>
              <button onClick={closeCart} className="w-full text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest transition-colors py-2">
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
