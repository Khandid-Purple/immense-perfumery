'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import ChatBot from './ChatBot';
import { PageTransition } from './ui/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useAppNavigate, useProductSelect } from '@/lib/navigation';

export function Shell({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const onNavigate = useAppNavigate();
  const onProductSelect = useProductSelect();
  const pathname = usePathname();

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

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-brand-bg dark:bg-dark-bg transition-colors duration-500 font-sans">
      <div className="bg-noise"></div>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div ref={blob1Ref} className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-pink-300/30 dark:bg-pink-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div ref={blob2Ref} className="absolute top-[10%] right-[-20%] w-[60%] h-[60%] bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div ref={blob3Ref} className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] bg-brand-pink/20 dark:bg-brand-pink/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
      </div>
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar onNavigate={onNavigate} />
        <main className="flex flex-col gap-0 flex-1">
          <PageTransition key={isAdmin ? 'admin' : pathname}>{children}</PageTransition>
        </main>
        <Footer onNavigate={onNavigate} />
      </div>
      {!isAdmin && <CartDrawer onCheckout={() => onNavigate('checkout')} />}
      {!isAdmin && <WishlistDrawer onProductSelect={onProductSelect} />}
      {!isAdmin && <ChatBot onProductSelect={onProductSelect} />}
    </div>
  );
}
