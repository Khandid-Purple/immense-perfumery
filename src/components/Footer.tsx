'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'newsletter', email }),
        });
      } catch { /* best-effort */ }
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
               Curating the world&apos;s most exquisite fragrances since 2020. Our flagship boutique is in ACP Estate, Accra.
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
          <a
            href="https://paulbotchwey.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-pink transition-colors"
          >
            Developed by Paul Botchwey
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
