/**
 * @file route.ts
 * @description ユーザー一覧取得APIエンドポイント
 * @route GET /api/users
 * @access Private（認証必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ 認証チェックの追加
 * ✅ successResponse でレスポンス生成
 * ✅ エラーハンドリングの統一
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { userRepository } from '@/repositories';
import type { User as PrismaUser } from '@prisma/client';
import {
  withErrorHandler,
  successResponse,
  AuthenticationError,
} from '@/lib/api/errorHandler';

// ============================================
// エンドポイント
// ============================================

/**
 * ユーザー一覧取得エンドポイント
 * 
 * @description
 * システムに登録されているユーザーの一覧を取得します。
 * 機密情報（パスワードハッシュ等）は除外されます。
 * 
 * @example
 * ```typescript
 * // Request
 * GET /api/users
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "users": [
 *       {
 *         "id": "user-id-1",
 *         "email": "user1@example.com",
 *         "username": "user1",
 *         "displayName": "User One",
 *         "avatarUrl": null,
 *         "status": "ONLINE",
 *         "createdAt": "2025-10-24T00:00:00.000Z"
 *       },
 *       {
 *         "id": "user-id-2",
 *         "email": "user2@example.com",
 *         "username": "user2",
 *         "displayName": "User Two",
 *         "avatarUrl": null,
 *         "status": "OFFLINE",
 *         "createdAt": "2025-10-24T00:00:00.000Z"
 *       }
 *     ]
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
  const auth = requireAuth(request);
  
  if ('error' in auth) {
    throw new AuthenticationError({
      reason: auth.error,
    });
  }

  // 2. ユーザー一覧取得
  //    パスワードハッシュなどの機密情報を除外
  const users: PrismaUser[] = await userRepository.findAll();

  // 3. 安全なユーザー情報にマッピング
  const safeUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    status: user.status,
    createdAt: user.createdAt,
  }));

  // 4. 成功レスポンス生成
  return successResponse({ users: safeUsers });
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（3行）
 * - 空配列を返すだけ
 * - 認証なし
 * - エラーハンドリングなし
 * 
 * ## 改善後（32行 + 機能実装）
 * - withErrorHandler でラップ
 * - 認証チェック追加
 * - 実際のユーザーデータ取得
 * - 機密情報の除外
 * - successResponse で統一フォーマット
 * 
 * ## メリット
 * 1. **セキュリティ向上**: 認証チェック追加
 * 2. **データ保護**: パスワードハッシュを除外
 * 3. **エラーハンドリング**: 統一されたエラーレスポンス
 * 4. **実用性**: 実際のデータを返す
 * 
 * ## TODO
 * 将来的な改善:
 * - ページネーション対応
 * - 検索フィルター追加
 * - ソート機能追加
 * - フィールド選択機能
 */
