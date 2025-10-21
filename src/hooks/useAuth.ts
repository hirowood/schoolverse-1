"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuthRestore() {
  const { restore } = useAuthStore();
  useEffect(() => { restore(); }, [restore]);
}

