"use client";
import { create } from 'zustand';

export type AuthUser = { id: string; email: string; displayName: string };

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string | null, user: AuthUser | null) => void;
  logout: () => void;
  restore: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('auth_token', token);
      if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    set({ token: null, user: null });
  },
  restore: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    set({ token, user });
  },
}));

