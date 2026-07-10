'use client';

import Register from '@/components/Register';
import { useAppNavigate } from '@/lib/navigation';

export default function RegisterPage() {
  const onNavigate = useAppNavigate();
  return <Register onNavigate={onNavigate} />;
}
