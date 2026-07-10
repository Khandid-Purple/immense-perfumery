'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import useSWR from 'swr';
import { authClient, useSession } from '@/lib/auth-client';
import { Address, Order, User } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Request failed');
  return res.json();
});

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  editAddress: (id: string, address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const sessionUser = session?.user;

  // Deliberately no `fallbackData` — it defeats SWR's on-mount revalidation
  // (see ShopContext.tsx). `?? []` below covers the pre-load gap instead.
  const { data: addresses, mutate: mutateAddresses } = useSWR<Address[]>(
    sessionUser ? '/api/addresses' : null, fetcher
  );
  const { data: orders, mutate: mutateOrders } = useSWR<Order[]>(
    sessionUser ? '/api/orders' : null, fetcher
  );

  const user: User | null = !isPending && sessionUser ? {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    avatar: sessionUser.image ?? null,
    role: ((sessionUser as unknown as { role?: string }).role as 'customer' | 'admin') ?? 'customer',
    addresses: addresses ?? [],
    orders: orders ?? [],
  } : null;

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message ?? 'Invalid credentials');
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message ?? 'Could not create account');
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar?: string }) => {
    await authClient.updateUser({ name: data.name, image: data.avatar });
  }, []);

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(address) });
    await mutateAddresses();
  }, [mutateAddresses]);

  const editAddress = useCallback(async (id: string, address: Omit<Address, 'id'>) => {
    await fetch(`/api/addresses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(address) });
    await mutateAddresses();
  }, [mutateAddresses]);

  const removeAddress = useCallback(async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    await mutateAddresses();
  }, [mutateAddresses]);

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    await mutateOrders();
  }, [mutateOrders]);

  const refreshUser = useCallback(async () => {
    await Promise.all([mutateAddresses(), mutateOrders()]);
  }, [mutateAddresses, mutateOrders]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      editAddress,
      removeAddress,
      cancelOrder,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
