/**
 * @file route.ts
 * @description 現在のユーザー情報取得APIエンドポイント
 * @route GET /api/auth/me
 * @access Private（認証必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ successResponse でレスポンス生成
 * ✅ 認証エラーを AppError で統一
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { authService } from '@/services/authService';
import {
  withErrorHandler,
  successResponse,
  AuthenticationError,
} from '@/lib/api/errorHandler';

// ============================================
// エンドポイント
// ============================================

/**
 * 現在のユーザー情報取得エンドポイント
 * 
 * @description
 * アクセストークンから現在のユーザー情報を取得します。
 * 
 * @example
 * ```typescript
 * // Request
 * GET /api/auth/me
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "user": {
 *       "id": "user-id",
 *       "email": "user@example.com",
 *       "username": "user123",
 *       "displayName": "User Name",
 *       "avatarUrl": null,
 *       "createdAt": "2025-10-24T00:00:00.000Z"
 *     }
 *   }
 * }
 * 
 * // Authentication Error Response (401)
 * {
 *   "error": {
 *     "code": "AUTH_UNAUTHORIZED",
 *     "message": "認証が必要です",
 *     "statusCode": 401,
 *     "timestamp": "2025-10-24T00:00:00.000Z"
 *   }
 * }
 * ```
 */
export const GET = withErrorHandler(async (request: NextRequest, _context) => {
  // 1. 認証チェック
  //    requireAuth はエラー時に { error: string } を返す
  const result = requireAuth(request);
  
  if ('error' in result) {
    // 認証エラーを統一形式でスロー
    throw new AuthenticationError({
      reason: result.error,
    });
  }

  // 2. ユーザー情報取得
  const user = await authService.getSafeUser(result.userId);
  
  if (!user) {
    // ユーザーが見つからない場合も認証エラー
    throw new AuthenticationError({
      reason: 'User not found',
      userId: result.userId,
    });
  }

  // 3. 成功レスポンス生成
  return successResponse({ user });
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（16行）
 * - 手動の認証チェック
 * - 手動のエラーレスポンス生成
 * - エラーコードが統一されていない
 * 
 * ## 改善後（21行 + エラーハンドリング強化）
 * - withErrorHandler でラップ
 * - AuthenticationError で統一
 * - successResponse で統一フォーマット
 * - メタデータ付きエラー
 * 
 * ## メリット
 * 1. **エラーの統一**: 認証エラーが統一フォーマット
 * 2. **メタデータの追加**: デバッグに役立つ情報を含む
 * 3. **型安全**: エラーレスポンスの型が保証される
 * 4. **ログの自動出力**: エラー時のログが自動で記録される
 * 
 * ## 今後の改善案
 * requireAuth を改善して AppError を直接投げるようにすると、
 * さらにコードが簡潔になります：
 * 
 * ```typescript
 * // 理想形
 * export const GET = withErrorHandler(async (request: NextRequest) => {
 *   const { userId } = await requireAuth(request); // エラーは自動スロー
 *   const user = await authService.getSafeUser(userId);
 *   if (!user) throw new AuthenticationError();
 *   return successResponse({ user });
 * });
 * ```
 */
