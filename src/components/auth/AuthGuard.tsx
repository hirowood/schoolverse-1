"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, restore } = useAuthStore();

  useEffect(() => {
    // Restore on first mount
    restore();
  }, [restore]);

  useEffect(() => {
    if (token === null) {
      const t = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!t) router.replace('/login');
    }
  }, [token, router]);

  return <>{children}</>;
}
