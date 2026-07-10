'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { ShopProvider } from '@/context/ShopContext';
import { AdminGate } from './AdminGate';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ShopProvider>
            <AdminGate />
            {children}
          </ShopProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
