"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuthBootstrap() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  useEffect(() => {
    fetchMe().catch(() => undefined);
  }, [fetchMe]);
}
