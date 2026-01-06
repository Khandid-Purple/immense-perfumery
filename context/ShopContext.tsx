
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';
import { api } from '../services/api';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [heroProductId, setHeroProductId] = useState<string>('1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    refreshProducts();
    fetchSettings();
  }, []);

  const refreshProducts = async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const id = await api.settings.getHeroProductId();
      setHeroProductId(id);
    } catch (e) {}
  };

  const setHeroProduct = async (id: string) => {
    try {
      await api.settings.setHeroProductId(id);
      setHeroProductId(id);
    } catch (e) {}
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedRecent = localStorage.getItem('recently_viewed');
    
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}
    if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
    if (savedRecent) try { setRecentlyViewedIds(JSON.parse(savedRecent)); } catch (e) {}
  }, []);

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewedIds)); }, [recentlyViewedIds]);

  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(pId => pId !== id);
      return [id, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const addToCart = (product: Product): boolean => {
    let success = true;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const latestProd = products.find(p => p.id === product.id);
      const stock = latestProd ? latestProd.stock : product.stock;

      if (existing) {
        if (existing.quantity >= stock) {
          success = false;
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (stock <= 0) {
        success = false;
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (success) setIsCartOpen(true);
    return success;
  };

  const updateQuantity = (productId: string, delta: number) => {
    // 1. Handle Direct Checkout Item (Buy Now flow)
    if (directCheckoutItem && directCheckoutItem.id === productId) {
      const newQty = directCheckoutItem.quantity + delta;
      if (newQty < 1) {
        setDirectCheckoutItem(null);
        return;
      }
      const latestProd = products.find(p => p.id === productId);
      const maxStock = latestProd ? latestProd.stock : 999;
      if (newQty <= maxStock) {
        setDirectCheckoutItem({ ...directCheckoutItem, quantity: newQty });
      }
      return;
    }

    // 2. Handle standard Cart items
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const latestProd = products.find(p => p.id === productId);
        const maxStock = latestProd ? latestProd.stock : 999;
        const newQty = item.quantity + delta;
        if (newQty > maxStock || newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const buyNow = (product: Product) => {
    const latest = products.find(p => p.id === product.id);
    if (latest && latest.stock > 0) setDirectCheckoutItem({ ...product, quantity: 1 });
  };

  const clearDirectCheckout = () => setDirectCheckoutItem(null);
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const toggleWishlist = (p: Product) => setWishlist(prev => prev.some(i => i.id === p.id) ? prev.filter(i => i.id !== p.id) : [...prev, p]);
  const isInWishlist = (id: string) => wishlist.some(i => i.id === id);
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
      toggleWishlist, addToRecentlyViewed, isInWishlist, openCart, closeCart, openWishlist, closeWishlist, refreshProducts, cartTotal, cartCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};
