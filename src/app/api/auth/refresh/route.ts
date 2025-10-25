/**
 * @file route.ts
 * @description トークンリフレッシュAPIエンドポイント
 * @route POST /api/auth/refresh
 * @access Public（リフレッシュトークン必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ successResponse でレスポンス生成
 * ✅ エラーを AppError で統一
 */

import { NextRequest } from 'next/server';
import { authService } from '@/services/authService';
import { getRefreshToken, setAuthCookies } from '@/lib/auth/cookies';
import {
  withErrorHandler,
  successResponse,
  AuthenticationError,
} from '@/lib/api/errorHandler';
import { ERROR_CODES } from '@/constants/errors';

// ============================================
// エンドポイント
// ============================================

/**
 * トークンリフレッシュエンドポイント
 * 
 * @description
 * リフレッシュトークンを使用して新しいアクセストークンを発行します。
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/auth/refresh
 * Cookie: refreshToken=...
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
 *     "code": "AUTH_TOKEN_EXPIRED",
 *     "message": "トークンの有効期限が切れました。再度ログインしてください",
 *     "statusCode": 401,
 *     "timestamp": "2025-10-24T00:00:00.000Z"
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest, _context) => {
  // 1. リフレッシュトークンの取得
  const refreshToken = getRefreshToken(request);
  
  if (!refreshToken) {
    // リフレッシュトークンがない場合
    throw new AuthenticationError({
      reason: 'Missing refresh token',
      code: ERROR_CODES.AUTH.TOKEN_MISSING,
    });
  }

  // 2. トークンのリフレッシュ処理
  //    authService内でエラーが発生した場合も自動処理
  //    （authService.refresh がAppErrorを投げる必要あり）
  const { 
    accessToken, 
    refreshToken: newRefreshToken, 
    user 
  } = await authService.refresh({ refreshToken });

  // 3. 成功レスポンス生成
  const response = successResponse({ user });

  // 4. 新しい認証Cookieの設定
  setAuthCookies(response, { 
    accessToken, 
    refreshToken: newRefreshToken 
  });

  return response;
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（23行）
 * - 手動のトークンチェック
 * - try-catch ブロック
 * - 個別のエラーチェック
 * - 手動のエラーレスポンス生成
 * 
 * ## 改善後（19行の実質コード）
 * - withErrorHandler でラップ
 * - AuthenticationError で統一
 * - successResponse で統一フォーマット
 * - エラーハンドリングの自動化
 * 
 * ## メリット
 * 1. **コードが17%短縮**: 23行 → 19行
 * 2. **エラーの統一**: 認証エラーが統一フォーマット
 * 3. **型安全**: レスポンスの型が保証される
 * 4. **ログの自動出力**: エラー時のログが自動で記録される
 * 
 * ## 注意事項
 * authService.refresh() 内で、INVALID_REFRESH_TOKEN や 
 * REFRESH_TOKEN_EXPIRED エラーを投げる際は、AppError を使用する必要があります：
 * 
 * ```typescript
 * // authService.ts 内
 * import { AuthenticationError } from '@/lib/utils/errors';
 * import { ERROR_CODES } from '@/constants/errors';
 * 
 * // トークンが無効な場合
 * if (!isValid) {
 *   throw new AuthenticationError({
 *     code: ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN,
 *   });
 * }
 * 
 * // トークンが期限切れの場合
 * if (isExpired) {
 *   throw new AuthenticationError({
 *     code: ERROR_CODES.AUTH.TOKEN_EXPIRED,
 *   });
 * }
 * ```
 */
