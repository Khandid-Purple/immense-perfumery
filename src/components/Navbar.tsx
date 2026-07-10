'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { cartCount, wishlist, openCart, openWishlist } = useShop();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = (t: string) => {
    if (t === 'light') return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    );
    if (t === 'dark') return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    );
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    );
  };

  if (isAdmin) {
    return (
      <nav className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto w-full z-50 relative">
        <div
          className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-lg"
          onClick={() => handleNavClick('admin')}
          tabIndex={0}
        >
           <div className="bg-gray-900 text-white font-serif font-bold p-1 px-2 rounded-sm text-lg shadow-lg">ADMIN</div>
           <span className="font-serif font-bold text-2xl text-gray-800 dark:text-gray-100 tracking-tight transition-colors">Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
           <button
            onClick={toggleTheme}
            className="p-2 bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:bg-white dark:hover:bg-white/20 transition-all border border-transparent dark:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
            title={`Theme: ${theme}`}
          >
            {getThemeIcon(theme)}
          </button>
           <button
              onClick={handleLogout}
              className="text-sm font-bold text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              Logout
            </button>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto w-full z-50 relative">
        <div
          className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-lg p-1"
          onClick={() => handleNavClick('home')}
          tabIndex={0}
        >
           <div className="bg-brand-pink text-white font-serif font-bold p-1 px-2 rounded-sm text-lg shadow-lg">IM</div>
           <span className="font-serif font-bold text-2xl text-gray-800 dark:text-gray-100 tracking-tight transition-colors">Immense <span className="text-brand-pink">Perfumery.</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Products', 'About', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item.toLowerCase())}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-pink dark:hover:text-brand-pink transition-colors pb-1 focus:outline-none focus-visible:text-brand-pink"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="hidden md:block p-2 bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:bg-white dark:hover:bg-white/20 transition-all border border-transparent dark:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
            title={`Theme: ${theme}`}
          >
            {getThemeIcon(theme)}
          </button>

          <button
            onClick={openWishlist}
            className="p-2 bg-brand-pink text-white rounded-xl shadow-md relative hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg"
            aria-label="View Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-brand-pink text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{wishlist.length}</span>
            )}
          </button>
          <button
            onClick={openCart}
            className="p-2 bg-brand-pink text-white rounded-xl shadow-md relative hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg"
            aria-label="View Shopping Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-brand-pink text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{cartCount}</span>
            )}
          </button>

          <button
            onClick={() => handleNavClick(isAuthenticated ? 'account' : 'login')}
            className="hidden md:flex items-center gap-2 p-1.5 px-3 bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:bg-white dark:hover:bg-white/20 transition-all border border-transparent dark:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
             {isAuthenticated && user?.avatar ? (
               <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-brand-pink/20" />
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             )}
             <span className="text-sm font-medium">{isAuthenticated && user ? user.name.split(' ')[0] : 'Sign In'}</span>
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-lg"
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 top-[88px] z-40 bg-white dark:bg-dark-bg backdrop-blur-md md:hidden animate-fade-in flex flex-col p-6 border-t border-gray-100 dark:border-white/10 overflow-y-auto">
           <div className="flex flex-col gap-6 text-center mt-4">
            {['Home', 'Products', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                className="text-2xl font-serif font-bold text-gray-800 dark:text-white hover:text-brand-pink transition-colors py-2"
              >
                {item}
              </button>
            ))}

            <div className="border-t border-gray-200 dark:border-white/10 my-4"></div>

            <button
                onClick={() => handleNavClick(isAuthenticated ? 'account' : 'login')}
                className="text-xl font-medium text-gray-800 dark:text-white hover:text-brand-pink transition-colors flex items-center justify-center gap-3 py-2"
              >
                {isAuthenticated && user?.avatar && (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-brand-pink" />
                )}
                {isAuthenticated ? 'My Account' : 'Sign In / Register'}
            </button>
           </div>

           <div className="mt-auto pt-10 pb-10 border-t border-gray-200 dark:border-white/10">
             <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-[0.2em]">Visual Experience</p>
             <div className="flex justify-center gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all w-24 ${theme === 'light' ? 'bg-brand-pink text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}
                >
                  {getThemeIcon('light')}
                  <span className="text-[10px] font-bold uppercase">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all w-24 ${theme === 'dark' ? 'bg-brand-pink text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}
                >
                  {getThemeIcon('dark')}
                  <span className="text-[10px] font-bold uppercase">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all w-24 ${theme === 'system' ? 'bg-brand-pink text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}
                >
                  {getThemeIcon('system')}
                  <span className="text-[10px] font-bold uppercase">System</span>
                </button>
             </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
