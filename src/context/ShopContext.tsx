'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import useSWR from 'swr';
import { Product, CartItem } from '@/lib/types';
import { useAuth } from './AuthContext';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Request failed');
  return res.json();
});

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  recentlyViewedIds: string[];
  directCheckoutItem: CartItem | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isLoadingProducts: boolean;
  heroProductId: string;
  setHeroProduct: (id: string) => Promise<void>;
  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  buyNow: (product: Product) => void;
  clearDirectCheckout: () => void;
  toggleWishlist: (product: Product) => void;
  addToRecentlyViewed: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  refreshProducts: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const { data: products = [], isLoading: isLoadingProducts, mutate: refreshProductsSWR } = useSWR<Product[]>('/api/products', fetcher);
  const { data: settings } = useSWR('/api/settings', fetcher);
  const heroProductId = settings?.heroProductId ?? '1';

  // ── Server-backed cart/wishlist (authenticated users) ──
  // Note: deliberately no `fallbackData` here — it defeats SWR's on-mount
  // revalidation (fallback data satisfies the "already has data" check, so
  // the real fetch never fires). The `?? []` defaults below cover the gap.
  const { data: serverCart, mutate: mutateServerCart } = useSWR<CartItem[]>(isAuthenticated ? '/api/cart' : null, fetcher);
  const { data: serverWishlist, mutate: mutateServerWishlist } = useSWR<Product[]>(isAuthenticated ? '/api/wishlist' : null, fetcher);

  // ── Guest cart/wishlist (localStorage, exactly like the original prototype) ──
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);
  const [guestWishlist, setGuestWishlist] = useState<Product[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const hasMergedGuestCart = useRef(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedRecent = localStorage.getItem('recently_viewed');
    if (savedCart) try { setGuestCart(JSON.parse(savedCart)); } catch { /* ignore */ }
    if (savedWishlist) try { setGuestWishlist(JSON.parse(savedWishlist)); } catch { /* ignore */ }
    if (savedRecent) try { setRecentlyViewedIds(JSON.parse(savedRecent)); } catch { /* ignore */ }
  }, []);

  useEffect(() => { localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewedIds)); }, [recentlyViewedIds]);
  useEffect(() => { if (!isAuthenticated) localStorage.setItem('cart', JSON.stringify(guestCart)); }, [guestCart, isAuthenticated]);
  useEffect(() => { if (!isAuthenticated) localStorage.setItem('wishlist', JSON.stringify(guestWishlist)); }, [guestWishlist, isAuthenticated]);

  // On login: merge the guest cart into the server cart once, then clear local state.
  useEffect(() => {
    if (!isAuthenticated || hasMergedGuestCart.current) return;
    hasMergedGuestCart.current = true;
    const merge = async () => {
      for (const item of guestCart) {
        await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: item.id, quantity: item.quantity }) });
      }
      for (const item of guestWishlist) {
        await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: item.id }) });
      }
      if (guestCart.length || guestWishlist.length) {
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        setGuestCart([]);
        setGuestWishlist([]);
        mutateServerCart();
        mutateServerWishlist();
      }
    };
    merge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => { if (!isAuthenticated) hasMergedGuestCart.current = false; }, [isAuthenticated]);

  const cart: CartItem[] = isAuthenticated ? (serverCart ?? []) : guestCart;
  const wishlist: Product[] = isAuthenticated ? (serverWishlist ?? []) : guestWishlist;

  const refreshProducts = async () => { await refreshProductsSWR(); };
  const setHeroProduct = async (id: string) => {
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ heroProductId: id }) });
    await refreshProductsSWR();
  };

  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewedIds((prev) => [id, ...prev.filter((pId) => pId !== id)].slice(0, 10));
  };

  const addToCart = (prod: Product): boolean => {
    const latest = products.find((p) => p.id === prod.id) ?? prod;
    if (isAuthenticated) {
      const existing = cart.find((i) => i.id === prod.id);
      if ((existing?.quantity ?? 0) >= latest.stock || latest.stock <= 0) return false;
      fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: prod.id, quantity: 1 }) })
        .then(() => mutateServerCart());
      setIsCartOpen(true);
      return true;
    }
    let success = true;
    setGuestCart((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        if (existing.quantity >= latest.stock) { success = false; return prev; }
        return prev.map((item) => item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (latest.stock <= 0) { success = false; return prev; }
      return [...prev, { ...prod, quantity: 1 }];
    });
    if (success) setIsCartOpen(true);
    return success;
  };

  const updateQuantity = (productId: string, delta: number) => {
    if (directCheckoutItem && directCheckoutItem.id === productId) {
      const newQty = directCheckoutItem.quantity + delta;
      if (newQty < 1) { setDirectCheckoutItem(null); return; }
      const maxStock = products.find((p) => p.id === productId)?.stock ?? 999;
      if (newQty <= maxStock) setDirectCheckoutItem({ ...directCheckoutItem, quantity: newQty });
      return;
    }

    const current = cart.find((i) => i.id === productId);
    if (!current) return;
    const maxStock = products.find((p) => p.id === productId)?.stock ?? 999;
    const newQty = current.quantity + delta;
    if (newQty > maxStock || newQty < 1) return;

    if (isAuthenticated) {
      fetch('/api/cart', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: newQty }) })
        .then(() => mutateServerCart());
    } else {
      setGuestCart((prev) => prev.map((item) => item.id === productId ? { ...item, quantity: newQty } : item));
    }
  };

  const buyNow = (prod: Product) => {
    const latest = products.find((p) => p.id === prod.id);
    if (latest && latest.stock > 0) setDirectCheckoutItem({ ...prod, quantity: 1 });
  };

  const clearDirectCheckout = () => setDirectCheckoutItem(null);

  const removeFromCart = (id: string) => {
    if (isAuthenticated) {
      fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) })
        .then(() => mutateServerCart());
    } else {
      setGuestCart((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      fetch('/api/cart', { method: 'DELETE' }).then(() => mutateServerCart());
    } else {
      setGuestCart([]);
    }
  };

  const toggleWishlist = (p: Product) => {
    const inWishlist = wishlist.some((i) => i.id === p.id);
    if (isAuthenticated) {
      const method = inWishlist ? 'DELETE' : 'POST';
      fetch('/api/wishlist', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: p.id }) })
        .then(() => mutateServerWishlist());
    } else {
      setGuestWishlist((prev) => inWishlist ? prev.filter((i) => i.id !== p.id) : [...prev, p]);
    }
  };

  const isInWishlist = (id: string) => wishlist.some((i) => i.id === id);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      products, cart, wishlist, recentlyViewedIds, directCheckoutItem, isCartOpen, isWishlistOpen, isLoadingProducts, heroProductId,
      setHeroProduct, addToCart, removeFromCart, updateQuantity, clearCart, buyNow, clearDirectCheckout,
      toggleWishlist, addToRecentlyViewed, isInWishlist, openCart, closeCart, openWishlist, closeWishlist, refreshProducts, cartTotal, cartCount,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
