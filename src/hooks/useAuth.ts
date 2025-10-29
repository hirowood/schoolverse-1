"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Backwards-compatible no-op bootstrap under NextAuth.
export function useAuthBootstrap() {
  // NextAuth hydrates session automatically; nothing to do here.
  // Kept to avoid import breakage while migrating.
  // Optionally, you could prefetch session-dependent data.
}

// Simple guard helper: redirect to /login when unauthenticated
export function useRequireAuth(redirectTo: string = '/login') {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unauthenticated') router.push(redirectTo);
  }, [status, router, redirectTo]);
  return status;
}
