'use client';

import Login from '@/components/Login';
import { useAppNavigate } from '@/lib/navigation';

export default function LoginPage() {
  const onNavigate = useAppNavigate();
  return <Login onNavigate={onNavigate} />;
}
