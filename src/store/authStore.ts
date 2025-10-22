"use client";
import { create } from 'zustand';
import type { AuthUser } from '@/types/user';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { email: string; username: string; password: string; displayName?: string; avatarUrl?: string }) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,
  clearError: () => set({ error: null }),
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await parseJsonResponse<{ error?: string }>(response);
        const message = data.error ?? 'LOGIN_FAILED';
        set({ error: message, isLoading: false, isAuthenticated: false });
        throw new Error(message);
      }

      const data = await parseJsonResponse<{ user: AuthUser }>(response);
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'LOGIN_FAILED', isLoading: false });
      }
      throw error;
    }
  },
  signup: async ({ email, username, password, displayName, avatarUrl }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, username, password, displayName, avatarUrl }),
      });

      if (!response.ok) {
        const data = await parseJsonResponse<{ error?: string }>(response);
        const message = data.error ?? 'SIGNUP_FAILED';
        set({ error: message, isLoading: false, isAuthenticated: false });
        throw new Error(message);
      }

      const data = await parseJsonResponse<{ user: AuthUser }>(response);
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'SIGNUP_FAILED', isLoading: false });
      }
      throw error;
    }
  },
  fetchMe: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const data = await parseJsonResponse<{ user: AuthUser }>(response);
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      console.error('[authStore] fetchMe error', error);
      set({ user: null, isAuthenticated: false, isLoading: false, error: 'FETCH_ME_FAILED' });
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      set({ ...initialState });
    }
  },
}));
