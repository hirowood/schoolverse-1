/**
 * @file auth.mock.ts
 * @description 認証機能のモック
 * @created 2025-10-24
 */

import { vi } from 'vitest';
import type { NextRequest } from 'next/server';

// ============================================
// 認証ミドルウェアのモック
// ============================================

/**
 * requireAuth のモック
 * 
 * デフォルトでは認証成功を返す。
 * エラーをシミュレートする場合は mockReturnValueOnce を使用。
 */
export const mockRequireAuth = vi.fn((request: NextRequest) => {
  // Cookie から userId を抽出（テスト用）
  const cookie = request.headers.get('Cookie');
  const match = cookie?.match(/accessToken=mock-token-([^;]+)/);
  
  if (match) {
    return {
      userId: match[1],
      email: `user-${match[1]}@test.com`,
    };
  }

  return {
    error: 'UNAUTHORIZED',
  };
});

/**
 * 認証エラーをモック
 */
export function mockAuthError(error: string = 'UNAUTHORIZED') {
  mockRequireAuth.mockReturnValueOnce({ error });
}

/**
 * 認証成功をモック
 */
export function mockAuthSuccess(userId: string) {
  mockRequireAuth.mockReturnValueOnce({
    userId,
    email: `user-${userId}@test.com`,
  });
}

/**
 * 認証モックをリセット
 */
export function resetAuthMock() {
  mockRequireAuth.mockClear();
}
