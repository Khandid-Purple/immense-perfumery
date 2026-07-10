'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { useToast } from '@/context/ToastContext';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      showToast(`Welcome to Immense Perfumery, ${name.split(' ')[0]}! ✨`, 'success');
      onNavigate('home');
    } catch (error: any) {
      showToast(error.message || 'Registration failed. Please try again.', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 px-6 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join Immense Perfumery today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-transparent dark:border-white/5 focus:bg-white dark:focus:bg-black/40 focus:border-brand-pink focus:ring-0 transition-colors text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-brand-pink font-medium hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
