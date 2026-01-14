
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
          <p className="text-gray-500 dark:text-gray-300 mb-10 text-lg font-light leading-relaxed">Please log in to manage your delivery details.</p>
          <Button onClick={() => onNavigate('login-from-checkout')} className="px-12 py-5 text-lg font-bold">Sign In to Checkout</Button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-2 border-transparent focus:border-brand-pink focus:bg-white dark:focus:bg-black/40 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/20";

  const freeShipPercent = Math.min(Math.round((subtotal / settings.freeShippingThreshold) * 100), 100);
  const remainingForFreeShip = Math.max(settings.freeShippingThreshold - subtotal, 0);

  return (
    <div className="animate-fade-in py-10 px-6 max-w-7xl mx-auto relative">
      {showConfetti && <Confetti />}
      
      {isSuccess && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-white/90 dark:bg-dark-bg/95 backdrop-blur-xl animate-fade-in">
           <div className="text-center animate-pop">
              <div className="w-24 h-24 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-pink/30">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">Merci Beaucoup!</h2>
              <p className="text-gray-500 dark:text-gray-300 text-lg mb-8">Your signature scent is being prepared for its journey.</p>
              <div className="flex items-center justify-center gap-3 text-brand-pink font-bold text-sm uppercase tracking-widest animate-pulse">
                 <div className="w-2 h-2 bg-current rounded-full"></div>
                 Redirecting to Store...
              </div>
           </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white transition-colors">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3 space-y-8">
          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">1</span>
              Delivery Details
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="First Name" aria-label="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass} />
                <input required placeholder="Last Name" aria-label="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Phone" aria-label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                <input placeholder="Digital Address (GPS)" aria-label="Ghana Post GPS Address" value={formData.digitalAddress} onChange={e => setFormData({...formData, digitalAddress: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select aria-label="Region" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className={inputClass}>
                  {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input required placeholder="City / Town" aria-label="City or Town" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} />
              </div>
              <input required placeholder="Street Address / Landmarks" aria-label="Street Address and Landmarks" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} />
            </form>
          </section>

          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">2</span>
              Shipping Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="shipping-method-label">
              {shippingOptions.map(option => (
                <label 
                  key={option.id} 
                  className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-brand-pink/30 ${
                    selectedShippingId === option.id 
                    ? 'border-brand-pink bg-brand-pink/5 dark:bg-brand-pink/10' 
                    : 'border-gray-100 dark:border-white/5 hover:border-brand-pink/30'
                  }`}
                >
                  <input type="radio" name="shipping" className="sr-only" checked={selectedShippingId === option.id} onChange={() => setSelectedShippingId(option.id)} />
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{option.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{option.desc}</p>
                  <p className="font-bold text-brand-pink text-xs mt-auto">{option.price === 0 ? 'FREE' : `₵${option.price}`}</p>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
             <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center text-sm font-bold">3</span>
                Special Touches
             </h2>
             <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-brand-pink/20 text-brand-pink rounded-2xl flex items-center justify-center shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7 12 7 12 7z"></path></svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">Signature Gift Wrapping</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Premium box + note (+₵{settings.giftWrapRate})</p>
                    </div>
                  </div>
                  {/* Luxury Toggle Switch */}
                  <button 
                    type="button"
                    onClick={() => setGiftWrap(!giftWrap)}
                    aria-pressed={giftWrap}
                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-card ${giftWrap ? 'bg-brand-pink' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className="sr-only">Add signature gift wrapping</span>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${giftWrap ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center px-1">
                      <label htmlFor="order-note" className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Order Note / Special Requests</label>
                      <span className={`text-[10px] font-bold ${orderNote.length >= 280 ? 'text-brand-pink' : 'text-gray-400 dark:text-gray-500'}`} aria-hidden="true">{orderNote.length}/300</span>
                   </div>
                   <textarea 
                      id="order-note"
                      placeholder="E.g. Please leave with the concierge, or 'Happy Birthday' message for gift wrap..." 
                      rows={4} 
                      maxLength={300}
                      value={orderNote} 
                      onChange={e => setOrderNote(e.target.value)} 
                      className={inputClass + " resize-none bg-gray-50/50 dark:bg-black/10 text-sm"}
                   />
                </div>
             </div>
          </section>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-dark-card p-6 md:p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl sticky top-24 transition-colors">
            <h2 className="text-2xl font-serif font-bold mb-8 text-gray-900 dark:text-white">Order Summary</h2>
            
            {/* Free Shipping Progress Card */}
            <div className="mb-10 p-5 rounded-[2rem] bg-pink-50/30 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/20 animate-fade-in text-center" aria-live="polite">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Free Shipping Progress</span>
                <span className="text-[11px] font-bold text-brand-pink" aria-label={`${freeShipPercent} percent complete`}>{freeShipPercent}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-black/40 rounded-full overflow-hidden mb-3 shadow-inner">
                <div 
                  className="h-full bg-brand-pink transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,77,141,0.4)]" 
                  style={{ width: `${freeShipPercent}%` }}
                ></div>
              </div>
              {freeShipPercent < 100 ? (
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-tighter">
                  Add <span className="text-brand-pink">₵{remainingForFreeShip.toLocaleString()}</span> more for free delivery!
                </p>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 animate-pop">
                   <span className="text-xs">✦</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Free Shipping Unlocked</span>
                   <span className="text-xs">✦</span>
                </div>
              )}
            </div>

            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
               {items.map(item => (
                 <div key={item.id} className="flex gap-4 group">
                    <img src={item.image} alt="" className="w-16 h-16 rounded-2xl object-cover bg-gray-50 dark:bg-white/5 flex-shrink-0 shadow-sm" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate mb-2">{item.name}</h4>
                       <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 rounded-full px-3 py-1 border border-transparent dark:border-white/10 shadow-inner">
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-brand-pink transition-colors font-bold text-lg focus:outline-none"
                            >−</button>
                            <span className="text-xs font-bold w-4 text-center text-gray-800 dark:text-gray-200" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-brand-pink transition-colors font-bold text-lg focus:outline-none"
                            >+</button>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">₵{(item.price * item.quantity).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            
            <form onSubmit={handleApplyPromo} className="flex gap-3 mb-10">
               <input placeholder="Promo Code" aria-label="Enter Promo Code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 dark:bg-black/20 text-xs border-transparent focus:border-brand-pink outline-none dark:text-white shadow-inner" />
               <button type="submit" className="px-6 py-3 bg-gray-400 dark:bg-white/10 dark:text-white text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-pink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">Apply</button>
            </form>

            <div className="space-y-4 border-t border-gray-100 dark:border-white/10 pt-8 mb-8">
               <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-light"><p>Subtotal</p><p className="font-medium text-gray-900 dark:text-gray-100">₵{subtotal.toLocaleString()}</p></div>
               <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-light"><p>Shipping ({selectedMethod.label})</p><p className="font-medium text-gray-900 dark:text-gray-100">{shippingCost === 0 ? 'FREE' : `₵${shippingCost}`}</p></div>
               {giftWrap && <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-light"><p>Gift Wrap</p><p className="font-medium text-gray-900 dark:text-gray-100">₵{settings.giftWrapRate}</p></div>}
               {appliedPromo && <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-bold"><p>Promo ({appliedPromo.code})</p><p>-₵{discount.toLocaleString()}</p></div>}
            </div>

            <div className="flex justify-between items-center mb-10">
               <span className="text-xl font-serif font-bold text-gray-900 dark:text-white">Total</span>
               <span className="text-3xl font-bold text-brand-pink">₵{finalTotal.toLocaleString()}</span>
            </div>

            <Button type="submit" form="checkout-form" disabled={loading || items.length === 0} className="w-full py-5 text-lg font-serif tracking-[0.1em] shadow-2xl shadow-brand-pink/30 hover:scale-[1.02] active:scale-100">
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </Button>
            
            <p className="mt-8 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center font-bold opacity-60">
              Secure Checkout Powered by Immense.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
