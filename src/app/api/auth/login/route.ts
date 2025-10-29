/**
 * DEPRECATED: This endpoint is superseded by Auth.js (NextAuth) Credentials.
 * Migrate clients to `POST /api/auth/[...nextauth]` via next-auth/react `signIn`.
 *
 * @file route.ts
 * @description ログインAPIエンドポイント
 * @route POST /api/auth/login
 * @access Public
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ validateRequestBody でバリデーション
 * ✅ successResponse でレスポンス生成
 * ✅ エラーハンドリングの自動化
 * ✅ ログ出力の統一
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { setAuthCookies } from '@/lib/auth/cookies';
import {
  withErrorHandler,
  validateRequestBody,
  successResponse,
} from '@/lib/api/errorHandler';

// ============================================
// バリデーションスキーマ
// ============================================

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
});

// ============================================
// エンドポイント
// ============================================

/**
 * ログインエンドポイント
 * 
 * @description
 * メールアドレスとパスワードでユーザーを認証し、
 * アクセストークンとリフレッシュトークンを発行します。
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/auth/login
 * Content-Type: application/json
 * 
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
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
 * // Error Response (401)
 * {
 *   "error": {
 *     "code": "AUTH_INVALID_CREDENTIALS",
 *     "message": "メールアドレスまたはパスワードが正しくありません",
 *     "statusCode": 401,
 *     "timestamp": "2025-10-24T00:00:00.000Z"
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest, _context) => {
  // 1. リクエストボディのバリデーション
  //    エラーは自動でスローされ、withErrorHandlerが処理
  const body = await validateRequestBody(request, loginSchema);

  // 2. ログイン処理実行
  //    authService内でエラーが発生した場合も自動処理
  const { accessToken, refreshToken, user } = await authService.login(body);

  // 3. 成功レスポンス生成
  const response = successResponse({ user });

  // 4. 認証Cookieの設定
  setAuthCookies(response, { accessToken, refreshToken });

  return response;
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（42行）
 * - 手動のJSON.parse + エラーハンドリング
 * - 手動のZodバリデーション + エラーレスポンス
 * - try-catch ブロック
 * - 個別のエラーチェック（INVALID_CREDENTIALS）
 * - 手動のエラーログ出力
 * - 手動のエラーレスポンス生成
 * 
 * ## 改善後（16行の実質コード）
 * - validateRequestBody が自動処理
 * - withErrorHandler が自動処理
 * - successResponse で統一フォーマット
 * - エラーログは自動出力
 * - エラーレスポンスは統一フォーマット
 * 
 * ## メリット
 * 1. **コードが63%短縮**: 42行 → 16行
 * 2. **型安全**: body の型が自動推論される
 * 3. **エラーハンドリング統一**: すべてのエラーが同じフォーマット
 * 4. **保守性向上**: ビジネスロジックに集中できる
 * 5. **ログの統一**: すべてのエラーが同じ形式で記録
 */
