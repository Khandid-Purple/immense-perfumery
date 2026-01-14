
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import ImageAnalyzer from './components/ImageAnalyzer';
import ChatBot from './components/ChatBot';
import RecentlyViewed from './components/RecentlyViewed';
import QuickViewModal from './components/QuickViewModal';
import { ShopProvider, useShop } from './context/ShopContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductDetails from './components/ProductDetails';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import GiftGuide from './components/GiftGuide';
import Wholesale from './components/Wholesale';
import Authenticity from './components/Authenticity';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import AdminDashboard from './components/AdminDashboard';
import { PageTransition } from './components/ui/PageTransition';
import { Product } from './types';
import { SEO } from './components/SEO';

type View = 'home' | 'products' | 'details' | 'about' | 'contact' | 'faq' | 'gift-guide' | 'wholesale' | 'authenticity' | 'checkout' | 'login' | 'register' | 'account' | 'admin';

const AdminRoute: React.FC<{ children: React.ReactNode, onNavigate: (page: string) => void }> = ({ children, onNavigate }) => {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Access Denied</h2>
         <p className="text-gray-500 mb-6">You do not have permission to view this page.</p>
         <button onClick={() => onNavigate('home')} className="px-6 py-2 bg-brand-pink text-white rounded-full">Go Home</button>
      </div>
    );
  }
  return <>{children}</>;
};

const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast("Thank you for joining! You're on the list. ✨", 'success');
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-md pt-20 pb-10 mt-20 border-t border-pink-100 dark:border-white/5 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
             <span className="font-serif font-bold text-3xl text-gray-900 dark:text-white block mb-6 tracking-tight">Immense <span className="text-brand-pink">Perfumery.</span></span>
             <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
               Curating the world's most exquisite fragrances since 2020. Our flagship boutique is in ACP Estate, Accra.
             </p>
             <div className="flex gap-4">
                {[
                  { name: 'Instagram', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z' },
                  { name: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' }
                ].map(social => (
                  <button key={social.name} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-brand-pink hover:text-white transition-all shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={social.path}/></svg>
                  </button>
                ))}
             </div>
          </div>

          <div className="col-span-1">
             <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Explore</h4>
             <div className="flex flex-col gap-4 text-sm text-gray-500 dark:text-gray-400">
                <button onClick={() => onNavigate('products')} className="text-left hover:text-brand-pink transition-colors">The Collection</button>
                <button onClick={() => onNavigate('gift-guide')} className="text-left hover:text-brand-pink transition-colors">Gift Guide</button>
                <button onClick={() => onNavigate('about')} className="text-left hover:text-brand-pink transition-colors">Our Story</button>
                <button onClick={() => onNavigate('authenticity')} className="text-left hover:text-brand-pink transition-colors">Authenticity Policy</button>
             </div>
          </div>

          <div className="col-span-1">
             <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Assistance</h4>
             <div className="flex flex-col gap-4 text-sm text-gray-500 dark:text-gray-400">
                <button onClick={() => onNavigate('contact')} className="text-left hover:text-brand-pink transition-colors">Customer Care</button>
                <button onClick={() => onNavigate('faq')} className="text-left hover:text-brand-pink transition-colors">Delivery FAQs</button>
                <button onClick={() => onNavigate('wholesale')} className="text-left hover:text-brand-pink transition-colors">Wholesale Inquiry</button>
             </div>
          </div>

          <div className="col-span-1">
             <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Stay Informed</h4>
             <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-pink/20 dark:text-white" />
                <button type="submit" className="bg-gray-900 dark:bg-brand-pink text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">Subscribe</button>
             </form>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
          <p>&copy; 2024 Immense Perfumery Collects. ACP Estate, Accra, Ghana.</p>
        </div>
      </div>
    </footer>
  );
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [intendedView, setIntendedView] = useState<View | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => { if (!isAuthenticated && (currentView === 'account' || currentView === 'admin')) setCurrentView('home'); }, [isAuthenticated, currentView]);
  useEffect(() => { if (isAdmin && currentView !== 'admin' && currentView !== 'details') setCurrentView('admin'); }, [isAdmin]);
  useEffect(() => { if (isAuthenticated && intendedView) { setCurrentView(intendedView); setIntendedView(null); } }, [isAuthenticated, intendedView]);

  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      requestAnimationFrame(() => {
        if (blob1Ref.current) blob1Ref.current.style.transform = `translateY(${scrollY * 0.4}px)`;
        if (blob2Ref.current) blob2Ref.current.style.transform = `translateY(${scrollY * 0.2}px)`;
        if (blob3Ref.current) blob3Ref.current.style.transform = `translateY(${scrollY * -0.3}px) scale(${1 + scrollY * 0.0005})`;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProductSelect = (product: Product) => { setSelectedProduct(product); setCurrentView('details'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleNavigate = (page: string) => {
    if (page === 'home') { setCurrentView('home'); setSelectedProduct(null); }
    else if (page === 'products') { setCurrentView('home'); setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100); }
    else if (page === 'about') setCurrentView('about');
    else if (page === 'contact') setCurrentView('contact');
    else if (page === 'faq') setCurrentView('faq');
    else if (page === 'gift-guide') setCurrentView('gift-guide');
    else if (page === 'wholesale') setCurrentView('wholesale');
    else if (page === 'authenticity') setCurrentView('authenticity');
    else if (page === 'checkout') setCurrentView('checkout');
    else if (page === 'login') setCurrentView('login');
    else if (page === 'login-from-checkout') { setIntendedView('checkout'); setCurrentView('login'); }
    else if (page === 'register') setCurrentView('register');
    else if (page === 'account') setCurrentView('account');
    else if (page === 'admin') setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getViewContent = () => {
    if (isAdmin) return <AdminRoute onNavigate={handleNavigate}><AdminDashboard /></AdminRoute>;
    switch (currentView) {
      case 'about': return <About />;
      case 'contact': return <Contact />;
      case 'faq': return <FAQ />;
      case 'gift-guide': return <GiftGuide onNavigate={handleNavigate} />;
      case 'wholesale': return <Wholesale />;
      case 'authenticity': return <Authenticity />;
      case 'checkout': return <Checkout onOrderComplete={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      case 'login': return <Login onNavigate={handleNavigate} />;
      case 'register': return <Register onNavigate={handleNavigate} />;
      case 'account': return <Account />;
      case 'admin': return <AdminRoute onNavigate={handleNavigate}><AdminDashboard /></AdminRoute>;
      case 'details': return selectedProduct ? <ProductDetails product={selectedProduct} onBack={() => handleNavigate('home')} onProductSelect={handleProductSelect} onBuyNow={() => handleNavigate('checkout')} /> : null;
      case 'home':
      default:
        return (
          <div className="flex flex-col">
            <SEO title="Immense Perfumery" description="Premium fragrances at ACP Estate, Accra. Authentic scents, AI matchmaker." />
            <Hero onNavigate={handleNavigate} onProductSelect={handleProductSelect} />
            <RecentlyViewed onProductSelect={handleProductSelect} />
            <ProductList onProductSelect={handleProductSelect} onQuickView={setQuickViewProduct} />
            <ImageAnalyzer onProductSelect={handleProductSelect} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-brand-bg dark:bg-dark-bg transition-colors duration-500 font-sans">
      <div className="bg-noise"></div>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div ref={blob1Ref} className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-pink-300/30 dark:bg-pink-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div ref={blob2Ref} className="absolute top-[10%] right-[-20%] w-[60%] h-[60%] bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div ref={blob3Ref} className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] bg-brand-pink/20 dark:bg-brand-pink/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
      </div>
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex flex-col gap-0 flex-1">
          <PageTransition key={isAdmin ? 'admin' : currentView}>{getViewContent()}</PageTransition>
        </main>
        <Footer onNavigate={handleNavigate} />
      </div>
      {!isAdmin && <CartDrawer onCheckout={() => handleNavigate('checkout')} />}
      {!isAdmin && <WishlistDrawer onProductSelect={handleProductSelect} />}
      {!isAdmin && <ChatBot onProductSelect={handleProductSelect} />}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onViewDetails={handleProductSelect} />
    </div>
  );
};

const App: React.FC = () => { return (<ThemeProvider><ToastProvider><AuthProvider><ShopProvider><AppContent /></ShopProvider></AuthProvider></ToastProvider></ThemeProvider>); };
export default App;
