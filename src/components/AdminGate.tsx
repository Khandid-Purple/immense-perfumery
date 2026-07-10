'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Matches the original prototype's behavior: an authenticated admin
 * always sees the Admin Dashboard, on any route except product details.
 */
export function AdminGate() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin && !pathname.startsWith('/admin') && !pathname.startsWith('/product/')) {
      router.replace('/admin');
    }
  }, [isAdmin, pathname, router]);

  return null;
}
