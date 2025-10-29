"use client";
import { create } from 'zustand';
import type { AuthUser } from '@/types/user';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null; // 🔧 必ず文字列型
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { 
    email: string; 
    username: string; 
    password: string; 
    displayName?: string; 
    avatarUrl?: string;
  }) => Promise<void>;
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

// ============================================
// 型定義
// ============================================

/**
 * 統一されたAPIレスポンス型
 * すべてのAPIエンドポイントは { data: T } 形式を返す
 */
type ApiResponse<T> = {
  data: T;
};

type AuthResponse = ApiResponse<{
  user: AuthUser;
}>;

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
};

// ============================================
// ヘルパー関数
// ============================================

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

/**
 * APIエラーレスポンスからメッセージを抽出
 * @param data - エラーレスポンスデータ
 * @returns 文字列のエラーメッセージ（必ず文字列を返す）
 */
function extractErrorMessage(data: unknown): string {
  // データがnullまたはundefinedの場合
  if (data == null) {
    return 'UNKNOWN_ERROR';
  }
  
  // データが文字列の場合
  if (typeof data === 'string') {
    return data;
  }
  
  // データがオブジェクトの場合
  if (typeof data === 'object') {
    const errorData = data as Partial<ErrorResponse>;
    
    // error.message が存在する場合
    if (errorData.error?.message && typeof errorData.error.message === 'string') {
      return errorData.error.message;
    }
    
    // error.code が存在する場合
    if (errorData.error?.code && typeof errorData.error.code === 'string') {
      return errorData.error.code;
    }
    
    // オブジェクト全体をJSON文字列化して返す（デバッグ用）
    try {
      return `エラーが発生しました: ${JSON.stringify(data)}`;
    } catch {
      return 'ERROR_PARSE_FAILED';
    }
  }
  
  // その他の型の場合
  return String(data) || 'UNKNOWN_ERROR';
}

// ============================================
// Zustand Store
// ============================================

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,
  
  clearError: () => set({ error: null }),
  
  // ============================================
  // ログイン処理
  // ============================================
  
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
        const data = await parseJsonResponse<ErrorResponse>(response);
        const message = extractErrorMessage(data);
        // 🔧 重要: errorは必ず文字列として保存
        set({ error: message, isLoading: false, isAuthenticated: false });
        throw new Error(message);
      }

      // 🔧 修正: data.data.user でアクセス
      const data = await parseJsonResponse<AuthResponse>(response);
      set({ 
        user: data.data.user, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      // 🔧 重要: errorは必ず文字列として保存
      let errorMessage = 'LOGIN_FAILED';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = extractErrorMessage(error);
      }
      
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  // ============================================
  // 新規登録処理
  // ============================================
  
  signup: async ({ email, username, password, displayName, avatarUrl }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          username, 
          password, 
          displayName, 
          avatarUrl 
        }),
      });

      if (!response.ok) {
        const data = await parseJsonResponse<ErrorResponse>(response);
        const message = extractErrorMessage(data);
        set({ error: message, isLoading: false, isAuthenticated: false });
        throw new Error(message);
      }

      // 🔧 修正: data.data.user でアクセス
      const data = await parseJsonResponse<AuthResponse>(response);
      set({ 
        user: data.data.user, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      // 🔧 重要: errorは必ず文字列として保存
      let errorMessage = 'SIGNUP_FAILED';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = extractErrorMessage(error);
      }
      
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  // ============================================
  // ユーザー情報取得処理
  // ============================================
  
  fetchMe: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      // 401エラーは正常な動作（未ログイン状態）
      if (!response.ok) {
        // 🔧 改善: 401の場合はエラーログを出力しない
        if (response.status !== 401) {
          console.error('[authStore] fetchMe failed', response.status);
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // 🔧 修正: data.data.user でアクセス
      const data = await parseJsonResponse<AuthResponse>(response);
      set({ 
        user: data.data.user, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      console.error('[authStore] fetchMe error', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: 'FETCH_ME_FAILED' 
      });
    }
  },
  
  // ============================================
  // ログアウト処理
  // ============================================
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[authStore] logout error', error);
    } finally {
      set({ ...initialState });
    }
  },
}));

