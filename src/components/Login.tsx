'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { useToast } from '@/context/ToastContext';

interface LoginProps {
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      onNavigate('login-success');
    } catch (error) {
      showToast('Login failed. Please check your credentials.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 px-6 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Access your account and saved items</p>
        </div>

        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm">
           <p className="font-bold text-blue-800 dark:text-blue-300 mb-2">Demo Credentials:</p>
           <div className="flex justify-between items-center mb-2">
             <span className="text-gray-600 dark:text-gray-400">Admin: <code className="bg-white dark:bg-black/30 px-1 rounded">admin@immense.com</code> / <code className="bg-white dark:bg-black/30 px-1 rounded">admin123</code></span>
             <button onClick={() => fillCredentials('admin@immense.com', 'admin123')} className="text-xs text-blue-600 hover:underline">Fill</button>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-gray-600 dark:text-gray-400">Customer: <code className="bg-white dark:bg-black/30 px-1 rounded">user@immense.com</code> / <code className="bg-white dark:bg-black/30 px-1 rounded">user123</code></span>
             <button onClick={() => fillCredentials('user@immense.com', 'user123')} className="text-xs text-blue-600 hover:underline">Fill</button>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-transparent dark:border-white/5 focus:bg-white dark:focus:bg-black/40 focus:border-brand-pink focus:ring-0 transition-colors text-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-transparent dark:border-white/5 focus:bg-white dark:focus:bg-black/40 focus:border-brand-pink focus:ring-0 transition-colors text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-brand-pink font-medium hover:underline"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
