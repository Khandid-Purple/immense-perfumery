
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
    // CRITICAL: Clear any pending "Buy Now" item so the checkout shows the full bag
    clearDirectCheckout();
    closeCart();
    onCheckout();
  };

  return (
    <Drawer isOpen={isCartOpen} onClose={closeCart} title="Your Shopping Bag">
      {cart.length > 0 && (
        <div className="absolute top-6 right-16">
          <button 
            onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
          >
            Clear Bag
          </button>
        </div>
      )}
      
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-brand-pink">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <p className="text-gray-500">Your bag is currently empty.</p>
          <Button variant="outline" onClick={closeCart} className="mt-4">Start Shopping</Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-500 hover:text-brand-pink w-6 h-6 flex items-center justify-center"
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-500 hover:text-brand-pink w-6 h-6 flex items-center justify-center"
                      >+</button>
                    </div>
                    <span className="font-semibold text-brand-pink">₵{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 self-start p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-2xl font-bold text-gray-900">₵{cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400 mb-6 text-center">Shipping and taxes calculated at checkout.</p>
            <Button onClick={handleCheckoutClick} className="w-full py-4 text-lg">Checkout Now</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
