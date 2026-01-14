
import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Order, CartItem, Address } from '../types';
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string, percent: number } | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('standard');
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  
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
      const defaultAddress = user.addresses.length > 0 ? user.addresses[0] : null;
      setFormData({ 
        email: user.email, 
        firstName: defaultAddress?.firstName || user.name.split(' ')[0], 
        lastName: defaultAddress?.lastName || user.name.split(' ').slice(1).join(' '),
        phone: defaultAddress?.phone || '',
        address: defaultAddress?.street || '',
        digitalAddress: defaultAddress?.digitalAddress || '',
        region: defaultAddress?.region || 'Greater Accra',
        city: defaultAddress?.city || ''
      });
    }
  }, [user]);

  const items = directCheckoutItem ? [directCheckoutItem] : cart;
  const subtotal = directCheckoutItem ? directCheckoutItem.price * directCheckoutItem.quantity : cartTotal;

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
    if (directCheckoutItem && directCheckoutItem.id === id) {
      clearDirectCheckout();
      onNavigate('home');
    } else {
      removeFromCart(id);
      if (cart.length <= 1) onNavigate('home');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        orderNote: orderNote.trim() || undefined,
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
      setIsSuccess(true);
      await refreshProducts();
      await refreshUser();
      
      if (directCheckoutItem) clearDirectCheckout();
      else clearCart();
      
      // Reduced delay and visual indicator added to JSX
      setTimeout(onOrderComplete, 2500);
    } catch (err: any) {
      showToast(err.message || 'Checkout failed.', 'info');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] w-full flex flex-col items-center justify-center py-20 px-6 animate-fade-in relative text-center">
        <div className="w-full max-w-lg bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 flex flex-col items-center justify-center relative z-10 animate-slide-up">
          <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mb-8">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900 dark:text-white">Sign in to complete your order</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg font-light leading-relaxed">Please log in to manage your delivery details.</p>
          <Button onClick={() => onNavigate('login-from-checkout')} className="px-12 py-5 text-lg font-bold">Sign In to Checkout</Button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-2 border-transparent focus:border-brand-pink focus:bg-white dark:focus:bg-black/40 transition-all outline-none";

  return (
    <div className="animate-fade-in py-10 px-6 max-w-7xl mx-auto relative">
      {showConfetti && <Confetti />}
      
      {/* Success Modal Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-white/90 dark:bg-dark-bg/95 backdrop-blur-xl animate-fade-in">
           <div className="text-center animate-pop">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">Merci Beaucoup!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">Your signature scent is being prepared for its journey.</p>
              <div className="flex items-center justify-center gap-3 text-brand-pink font-bold text-sm uppercase tracking-widest animate-pulse">
                 <div className="w-2 h-2 bg-current rounded-full"></div>
                 Redirecting to Store...
              </div>
           </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-800 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white transition-colors">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3 space-y-8">
          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
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
                <input required placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                <input placeholder="Digital Address (GPS)" value={formData.digitalAddress} onChange={e => setFormData({...formData, digitalAddress: e.target.value})} className={inputClass} />
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

          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">2</span>
              Shipping Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shippingOptions.map(option => (
                <label 
                  key={option.id} 
                  className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedShippingId === option.id 
                    ? 'border-brand-pink bg-brand-pink/5' 
                    : 'border-gray-100 dark:border-white/5 hover:border-brand-pink/30'
                  }`}
                >
                  <input type="radio" name="shipping" className="hidden" checked={selectedShippingId === option.id} onChange={() => setSelectedShippingId(option.id)} />
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{option.label}</p>
                  <p className="text-[10px] text-gray-500 mb-2">{option.desc}</p>
                  <p className="font-bold text-brand-pink text-xs mt-auto">{option.price === 0 ? 'FREE' : `₵${option.price}`}</p>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
             <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">3</span>
                Special Touches
             </h2>
             <div className="space-y-4">
                <button 
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${giftWrap ? 'bg-brand-pink/5 border-brand-pink' : 'bg-gray-50 dark:bg-white/5 border-transparent'}`}
                >
                   <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-pink"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7 12 7 12 7z"></path></svg>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Add Signature Gift Wrapping (+₵{settings.giftWrapRate})</span>
                   </div>
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${giftWrap ? 'bg-brand-pink border-brand-pink text-white' : 'border-gray-300'}`}>
                      {giftWrap && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                   </div>
                </button>
                <textarea 
                   placeholder="Order notes, landmarks, or gift message..." 
                   rows={3} 
                   value={orderNote} 
                   onChange={e => setOrderNote(e.target.value)} 
                   className={inputClass + " resize-none"}
                />
             </div>
          </section>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-xl sticky top-24 transition-colors">
            <h2 className="text-xl font-serif font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>
            <div className="space-y-4 mb-8">
               {items.map(item => (
                 <div key={item.id} className="flex gap-3 group">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">{item.name}</h4>
                       <div className="flex justify-between items-center mt-1">
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                          <p className="text-xs font-bold">₵{(item.price * item.quantity).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            
            <form onSubmit={handleApplyPromo} className="flex gap-2 mb-8">
               <input placeholder="Promo Code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-black/20 text-xs border-transparent focus:border-brand-pink outline-none dark:text-white" />
               <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-[10px] font-bold">Apply</button>
            </form>

            <div className="space-y-2 border-t border-gray-100 dark:border-white/10 pt-6 mb-6">
               <div className="flex justify-between text-xs text-gray-500"><p>Subtotal</p><p>₵{subtotal.toLocaleString()}</p></div>
               <div className="flex justify-between text-xs text-gray-500"><p>Shipping</p><p>{shippingCost === 0 ? 'FREE' : `₵${shippingCost}`}</p></div>
               {giftWrap && <div className="flex justify-between text-xs text-gray-500"><p>Gift Wrap</p><p>₵{settings.giftWrapRate}</p></div>}
               {appliedPromo && <div className="flex justify-between text-xs text-green-600 font-bold"><p>Promo ({appliedPromo.code})</p><p>-₵{discount.toLocaleString()}</p></div>}
            </div>

            <div className="flex justify-between items-center mb-8">
               <span className="text-lg font-serif font-bold text-gray-900 dark:text-white">Total</span>
               <span className="text-2xl font-bold text-brand-pink">₵{finalTotal.toLocaleString()}</span>
            </div>

            <Button type="submit" form="checkout-form" disabled={loading || items.length === 0} className="w-full py-5 text-lg font-serif tracking-widest shadow-brand-pink/30">
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
