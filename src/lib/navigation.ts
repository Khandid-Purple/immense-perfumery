'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const ROUTES: Record<string, string> = {
  home: '/',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  'gift-guide': '/gift-guide',
  wholesale: '/wholesale',
  authenticity: '/authenticity',
  checkout: '/checkout',
  login: '/login',
  register: '/register',
  account: '/account',
  admin: '/admin',
};

/**
 * Preserves the original prototype's onNavigate('page-name') calling
 * convention (still used verbatim by Navbar/Footer/Hero/GiftGuide/etc.)
 * so those components didn't need touching, while actually driving
 * real Next.js routing underneath.
 */
export function useAppNavigate() {
  const router = useRouter();
  return useCallback((page: string) => {
    if (page === 'products') {
      if (window.location.pathname !== '/') {
        router.push('/#products');
      } else {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (page === 'login-from-checkout') {
      router.push('/login?next=/checkout');
      return;
    }
    if (page === 'login-success') {
      const params = new URLSearchParams(window.location.search);
      router.push(params.get('next') ?? '/');
      return;
    }
    router.push(ROUTES[page] ?? '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);
}

/** Navigate to a product's detail page (replaces the old setCurrentView('details') pattern). */
export function useProductSelect() {
  const router = useRouter();
  return useCallback((product: { id: string }) => {
    router.push(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);
}
