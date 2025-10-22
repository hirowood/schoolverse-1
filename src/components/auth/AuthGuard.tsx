"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuthBootstrap } from '@/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated && isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        認証情報を確認しています…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
