
import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Order, CartItem } from '../types';
import Confetti from './ui/Confetti';
import { GHANA_REGIONS, api } from '../services/api';

interface CheckoutProps {
  onOrderComplete: () => void;
  onNavigate: (page: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onOrderComplete, onNavigate }) => {
  const { cart, cartTotal, clearCart, directCheckoutItem, clearDirectCheckout, refreshProducts, removeFromCart, updateQuantity } = useShop();
  const { showToast } = useToast();
  const { isAuthenticated, user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string, percent: number } | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('standard');
  const [giftWrap, setGiftWrap] = useState(false);
  
  // API settings
  const [settings, setSettings] = useState<any>({
    freeShippingThreshold: 3000,
    standardShippingRate: 45,
    expressShippingRate: 80,
    giftWrapRate: 25
  });
  const [validPromos, setValidPromos] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const [s, p] = await Promise.all([api.settings.get(), api.promos.getAll()]);
      setSettings(s);
      setValidPromos(p);
    };
    fetchSettings();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', address: '', digitalAddress: '', region: 'Greater Accra', city: '', phone: '', email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(p => ({ 
        ...p, 
        email: user.email, 
        firstName: user.name.split(' ')[0], 
        lastName: user.name.split(' ').slice(1).join(' ') 
      }));
    }
  }, [user]);

  // Use the direct checkout item if it exists, otherwise use the main cart
  const items = directCheckoutItem ? [directCheckoutItem] : cart;
  const subtotal = directCheckoutItem ? directCheckoutItem.price : cartTotal;

  const shippingOptions = [
    { id: 'pickup', label: 'Shop Pickup', price: 0, desc: 'Collect from ACP Estate, Accra' },
    { id: 'standard', label: 'Standard Delivery', price: subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingRate, desc: '3-5 Business Days' },
    { id: 'express', label: 'Express Delivery', price: settings.expressShippingRate, desc: 'Next Day Delivery' }
  ];

  const selectedMethod = shippingOptions.find(o => o.id === selectedShippingId) || shippingOptions[0];
  const shippingCost = selectedMethod.price;
  const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.percent / 100)) : 0;
  const giftWrapCost = giftWrap ? settings.giftWrapRate : 0;
  const finalTotal = subtotal - discount + shippingCost + giftWrapCost;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.toUpperCase().trim();
    const found = validPromos.find(p => p.code === code);
    if (found) {
      setAppliedPromo({ code, percent: found.discount });
      showToast(`${found.discount}% discount applied!`, 'success');
      setPromoCode('');
    } else {
      showToast('Invalid promo code', 'info');
    }
  };

  const handleItemRemove = (id: string) => {
    if (directCheckoutItem) {
      clearDirectCheckout();
      onNavigate('home');
    } else {
      removeFromCart(id);
      if (cart.length <= 1) onNavigate('home');
    }
  };

  const handleItemQtyUpdate = (id: string, delta: number) => {
    if (directCheckoutItem) {
      // If direct checkout, clear it and push to cart for better management
      clearDirectCheckout();
      updateQuantity(id, delta);
    } else {
      updateQuantity(id, delta);
    }
  };

  const validateInputs = () => {
    const phoneRegex = /^(?:\+233|0)[235][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast('Please enter a valid Ghanaian phone number.', 'info');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    
    try {
      const order: Order = {
        id: 'ord-' + Date.now(),
        userId: user?.id || 'guest',
        date: new Date().toLocaleDateString(),
        items: [...items],
        subtotal,
        discount,
        giftWrap,
        shippingMethod: selectedMethod.label,
        shippingCost,
        total: finalTotal,
        status: 'Order Confirmed',
        shippingAddress: {
          id: 'temp-' + Date.now(), 
          label: 'Shipping', 
          firstName: formData.firstName,
          lastName: formData.lastName, 
          street: formData.address, 
          digitalAddress: formData.digitalAddress,
          region: formData.region, 
          city: formData.city, 
          phone: formData.phone
        }
      };

      await api.orders.create(order);
      setShowConfetti(true);
      await refreshProducts();
      await refreshUser();
      
      if (directCheckoutItem) clearDirectCheckout();
      else clearCart();
      
      showToast('Order placed successfully!', 'success');
      setTimeout(onOrderComplete, 4000);
    } catch (err: any) {
      showToast(err.message || 'Checkout failed.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const shippingProgress = Math.min((subtotal / settings.freeShippingThreshold) * 100, 100);
  const neededForFree = settings.freeShippingThreshold - subtotal;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-6 animate-fade-in relative text-center">
        {/* Background Decorative Globs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-pink/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-[100px]"></div>
        </div>
        
        {/* Main Content Card - Now strictly flex-col centered */}
        <div className="w-full max-w-lg bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 flex flex-col items-center justify-center relative z-10 animate-slide-up">
          <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mb-8">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900 dark:text-white">Sign in to complete your order</h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg font-light leading-relaxed">
            Please log in or create an account to secure your signature fragrance and manage your delivery details.
          </p>
          
          <Button 
            onClick={() => onNavigate('login-from-checkout')} 
            className="w-full sm:w-auto px-12 py-5 text-lg font-bold shadow-xl shadow-brand-pink/30 hover:scale-105 active:scale-95"
          >
            Sign In to Checkout
          </Button>
          
          <button 
             onClick={() => onNavigate('home')}
             className="mt-8 text-sm font-bold text-gray-400 hover:text-brand-pink transition-colors uppercase tracking-widest"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-2 border-transparent focus:border-brand-pink focus:bg-white dark:focus:bg-black/40 transition-all outline-none";

  return (
    <div className="animate-fade-in py-10 px-6 max-w-7xl mx-auto">
      {showConfetti && <Confetti />}
      
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-800 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white transition-colors">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* 1. Shipping Information */}
          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">1</span>
              Delivery Details
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass} />
                <input required placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Phone (e.g. 055...)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                <input placeholder="Digital Address (GA-123-4567)" value={formData.digitalAddress} onChange={e => setFormData({...formData, digitalAddress: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className={inputClass}>
                  {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input required placeholder="City / Town" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} />
              </div>
              <input required placeholder="Street Address / Landmarks" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} />
            </form>
          </section>

          {/* 2. Shipping Methods */}
          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">2</span>
              Shipping Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shippingOptions.map(option => (
                <label 
                  key={option.id} 
                  className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedShippingId === option.id 
                    ? 'border-brand-pink bg-brand-pink/5' 
                    : 'border-gray-100 dark:border-white/5 hover:border-brand-pink/30'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="shipping" 
                    className="hidden" 
                    checked={selectedShippingId === option.id}
                    onChange={() => setSelectedShippingId(option.id)}
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{option.label}</p>
                    <p className="text-[10px] text-gray-500">{option.desc}</p>
                  </div>
                  <p className="font-bold text-brand-pink text-xs">
                    {option.price === 0 ? 'FREE' : `₵${option.price}`}
                  </p>
                </label>
              ))}
            </div>
          </section>

          {/* 3. Gift Options */}
          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm transition-all">
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                   <div className="w-14 h-14 rounded-[1.2rem] bg-brand-pink/10 dark:bg-brand-pink/5 flex items-center justify-center text-brand-pink flex-shrink-0 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                   </div>
                   <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Signature Gift Wrapping</h3>
                      <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">Premium pink box with a handwritten note (+₵{settings.giftWrapRate})</p>
                   </div>
                </div>
                <button 
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`w-14 h-7 rounded-full transition-all relative flex-shrink-0 ${giftWrap ? 'bg-brand-pink' : 'bg-gray-200 dark:bg-white/10'}`}
                  aria-label="Toggle Gift Wrapping"
                >
                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${giftWrap ? 'left-[calc(100%-24px)]' : 'left-1'}`}></div>
                </button>
             </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-xl sticky top-24 transition-colors">
            <h2 className="text-xl font-serif font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>

            {/* Free Shipping Progress */}
            <div className="mb-8 p-4 bg-brand-pink/5 rounded-2xl border border-brand-pink/10">
               <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Free Shipping Progress</span>
                  <span className="text-brand-pink">{shippingProgress.toFixed(0)}%</span>
               </div>
               <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-pink transition-all duration-1000" style={{ width: `${shippingProgress}%` }}></div>
               </div>
               {neededForFree > 0 ? (
                 <p className="text-[10px] text-gray-500 mt-2 text-center">Add <span className="font-bold text-brand-pink">₵{neededForFree.toLocaleString()}</span> more for free delivery!</p>
               ) : (
                 <p className="text-[10px] text-green-600 mt-2 text-center font-bold uppercase tracking-wider">✦ Free shipping unlocked ✦</p>
               )}
            </div>
            
            <div className="space-y-4 mb-8">
               {items.map(item => (
                 <div key={item.id} className="flex gap-3 group">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-black/20 overflow-hidden flex-shrink-0">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{item.name}</h4>
                          <button 
                            onClick={() => handleItemRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                       </div>
                       <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleItemQtyUpdate(item.id, -1)} className="w-5 h-5 rounded-md bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] hover:bg-brand-pink hover:text-white transition-colors text-gray-500">-</button>
                             <span className="text-[10px] font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                             <button onClick={() => handleItemQtyUpdate(item.id, 1)} className="w-5 h-5 rounded-md bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] hover:bg-brand-pink hover:text-white transition-colors text-gray-500">+</button>
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">₵{(item.price * item.quantity).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 mb-8">
               <input 
                 placeholder="Promo Code" 
                 value={promoCode}
                 onChange={e => setPromoCode(e.target.value)}
                 className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-black/20 text-sm border-transparent focus:border-brand-pink outline-none transition-all dark:text-white"
               />
               <button 
                 type="submit"
                 disabled={!promoCode.trim()}
                 className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-bold hover:bg-brand-pink dark:hover:bg-brand-pink dark:hover:text-white transition-all disabled:opacity-50"
               >
                 Apply
               </button>
            </form>

            <div className="space-y-3 border-t border-gray-100 dark:border-white/10 pt-6 mb-8">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                 <span className="font-medium text-gray-900 dark:text-white">₵{subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500 dark:text-gray-400">Shipping ({selectedMethod.label})</span>
                 <span className="font-medium text-gray-900 dark:text-white">{shippingCost === 0 ? 'FREE' : `₵${shippingCost}`}</span>
               </div>
               {giftWrap && (
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Gift Wrapping</span>
                   <span className="font-medium text-gray-900 dark:text-white">₵{settings.giftWrapRate}</span>
                 </div>
               )}
               {appliedPromo && (
                 <div className="flex justify-between text-sm text-green-600 font-bold">
                   <span>Discount ({appliedPromo.code})</span>
                   <span>-₵{discount.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="flex justify-between items-center mb-8">
               <span className="text-lg font-serif font-bold text-gray-900 dark:text-white">Total</span>
               <span className="text-2xl font-bold text-brand-pink">₵{finalTotal.toLocaleString()}</span>
            </div>

            <Button 
              type="submit" 
              form="checkout-form" 
              disabled={loading || items.length === 0} 
              className="w-full py-5 text-lg font-serif tracking-widest shadow-brand-pink/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   PROCESSING...
                </div>
              ) : 'PLACE ORDER'}
            </Button>
            
            <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-widest">
              Secure Checkout Powered by Immense.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
