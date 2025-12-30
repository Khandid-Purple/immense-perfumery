
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address, Order } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  cancelOrder: (orderId: string) => void;
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_session');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const loggedInUser = await api.auth.login(email, password);
    setUser(loggedInUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = await api.auth.register(name, email, password);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      await api.auth.updateProfile(updatedUser);
      setUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const refreshedUser = await api.users.getById(user.id);
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      } catch (error) {
        console.error("Failed to refresh user data", error);
      }
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    if (user) {
      const newAddress: Address = {
        id: 'addr-' + Date.now(),
        ...addressData
      };
      const updatedUser = { ...user, addresses: [...user.addresses, newAddress] };
      await api.auth.updateProfile(updatedUser);
      setUser(updatedUser);
    }
  };

  const removeAddress = async (id: string) => {
    if (user) {
      const updatedUser = { ...user, addresses: user.addresses.filter(a => a.id !== id) };
      await api.auth.updateProfile(updatedUser);
      setUser(updatedUser);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (user) {
      await api.orders.updateStatus(orderId, 'Cancelled');
      const updatedUser = {
        ...user,
        orders: user.orders.map(order => 
          order.id === orderId ? { ...order, status: 'Cancelled' as const } : order
        )
      };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      cancelOrder,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
