
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import ImageAnalyzer from './components/ImageAnalyzer';
import ChatBot from './components/ChatBot';
import RecentlyViewed from './components/RecentlyViewed';
import QuickViewModal from './components/QuickViewModal';
import { ShopProvider, useShop } from './context/ShopContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductDetails from './components/ProductDetails';
import About from './components/About';
import Contact from './components/Contact';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import AdminDashboard from './components/AdminDashboard';
import { PageTransition } from './components/ui/PageTransition';
import { Product } from './types';
import { SEO } from './components/SEO';

type View = 'home' | 'products' | 'details' | 'about' | 'contact' | 'checkout' | 'login' | 'register' | 'account' | 'admin';

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

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [intendedView, setIntendedView] = useState<View | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      setCurrentView('admin');
    }
  }, [isAdmin]);

  // Handle redirect after login
  useEffect(() => {
    if (isAuthenticated && intendedView) {
      setCurrentView(intendedView);
      setIntendedView(null);
    }
  }, [isAuthenticated, intendedView]);

  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      requestAnimationFrame(() => {
        if (blob1Ref.current) {
          blob1Ref.current.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
        if (blob2Ref.current) {
          blob2Ref.current.style.transform = `translateY(${scrollY * 0.2}px)`;
        }
        if (blob3Ref.current) {
          blob3Ref.current.style.transform = `translateY(${scrollY * -0.3}px) scale(${1 + scrollY * 0.0005})`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      setCurrentView('home');
      setSelectedProduct(null);
    } else if (page === 'products') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('products');
        if(el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (page === 'about') {
      setCurrentView('about');
    } else if (page === 'contact') {
      setCurrentView('contact');
    } else if (page === 'checkout') {
      setCurrentView('checkout');
    } else if (page === 'login') {
      setCurrentView('login');
    } else if (page === 'login-from-checkout') {
      setIntendedView('checkout');
      setCurrentView('login');
    } else if (page === 'register') {
      setCurrentView('register');
    } else if (page === 'account') {
      setCurrentView('account');
    } else if (page === 'admin') {
      setCurrentView('admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getViewContent = () => {
    if (isAdmin) {
       return <AdminRoute onNavigate={handleNavigate}><AdminDashboard /></AdminRoute>;
    }

    switch (currentView) {
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'checkout':
        return <Checkout onOrderComplete={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'account':
        return <Account />;
      case 'admin':
        return <AdminRoute onNavigate={handleNavigate}><AdminDashboard /></AdminRoute>;
      case 'details':
        return selectedProduct ? (
          <ProductDetails 
            product={selectedProduct} 
            onBack={() => handleNavigate('home')} 
            onProductSelect={handleProductSelect}
            onBuyNow={() => handleNavigate('checkout')}
          />
        ) : null;
      case 'home':
      default:
        return (
          <div className="flex flex-col">
             <SEO 
               title="Immense Perfumery" 
               description="Experience the essence of elegance. Shop premium perfumes, analyze scents with AI, and discover your signature fragrance." 
             />
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
      
      {/* Noise Texture Overlay */}
      <div className="bg-noise"></div>

      {/* Motion Blurred Pink Spray Background (Parallax) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div ref={blob1Ref} className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-pink-300/30 dark:bg-pink-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen transition-all duration-700"></div>
        <div ref={blob2Ref} className="absolute top-[10%] right-[-20%] w-[60%] h-[60%] bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen transition-all duration-700"></div>
        <div ref={blob3Ref} className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] bg-brand-pink/20 dark:bg-brand-pink/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen transition-all duration-700"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar onNavigate={handleNavigate} />
        
        <main className="flex flex-col gap-0 flex-1">
          <PageTransition key={isAdmin ? 'admin' : currentView}>
            {getViewContent()}
          </PageTransition>
        </main>

        <footer className="w-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-md pt-16 pb-8 mt-20 border-t border-pink-100 dark:border-white/5 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
              <div className="md:w-1/3">
                 <span className="font-serif font-bold text-2xl text-gray-900 dark:text-white block mb-4">Immense Perfumery.</span>
                 <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                   Curating the world's most exquisite fragrances. We believe that a scent is more than just a smell; it's a memory waiting to be made.
                 </p>
              </div>

              <div className="md:w-1/3">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                 <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <button onClick={() => handleNavigate('home')} className="text-left hover:text-brand-pink">Home</button>
                    <button onClick={() => handleNavigate('products')} className="text-left hover:text-brand-pink">Collection</button>
                    <button onClick={() => handleNavigate('about')} className="text-left hover:text-brand-pink">Our Story</button>
                    <button onClick={() => handleNavigate('contact')} className="text-left hover:text-brand-pink">Concierge</button>
                 </div>
              </div>

              <div className="md:w-1/3">
                 <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Stay Updated</h4>
                 <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">ACP Estate, Accra.</p>
                 <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-bold">+233 24 280 2741</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 dark:text-gray-500 text-xs">
              <p>&copy; 2024 Immense Perfumery. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {!isAdmin && <CartDrawer onCheckout={() => handleNavigate('checkout')} />}
      {!isAdmin && <WishlistDrawer />}
      {!isAdmin && <ChatBot onProductSelect={handleProductSelect} />}
      
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
        onViewDetails={handleProductSelect}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ShopProvider>
            <AppContent />
          </ShopProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
