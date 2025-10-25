/**
 * @file route.ts
 * @description ユーザー登録APIエンドポイント
 * @route POST /api/auth/register
 * @access Public
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ validateRequestBody でバリデーション
 * ✅ successResponse でレスポンス生成
 * ✅ バリデーションエラーの詳細を自動表示
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

const registerSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください'),
  
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上である必要があります')
    .max(20, 'ユーザー名は20文字以内である必要があります')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'ユーザー名は英数字とアンダースコアのみ使用できます'
    ),
  
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードには英小文字、英大文字、数字を含める必要があります'
    ),
  
  displayName: z
    .string()
    .min(1, '表示名は1文字以上である必要があります')
    .max(50, '表示名は50文字以内である必要があります')
    .optional(),
  
  avatarUrl: z
    .string()
    .url('有効なURLを入力してください')
    .optional(),
});

// ============================================
// エンドポイント
// ============================================

/**
 * ユーザー登録エンドポイント
 * 
 * @description
 * 新規ユーザーを登録し、アクセストークンとリフレッシュトークンを発行します。
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/auth/register
 * Content-Type: application/json
 * 
 * {
 *   "email": "newuser@example.com",
 *   "username": "newuser123",
 *   "password": "Password123",
 *   "displayName": "New User"
 * }
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "user": {
 *       "id": "user-id",
 *       "email": "newuser@example.com",
 *       "username": "newuser123",
 *       "displayName": "New User",
 *       "avatarUrl": null,
 *       "createdAt": "2025-10-24T00:00:00.000Z"
 *     }
 *   }
 * }
 * 
 * // Validation Error Response (400)
 * {
 *   "error": {
 *     "code": "VALIDATION_FAILED",
 *     "message": "入力内容に誤りがあります",
 *     "statusCode": 400,
 *     "timestamp": "2025-10-24T00:00:00.000Z",
 *     "validationErrors": [
 *       {
 *         "field": "password",
 *         "message": "パスワードは8文字以上である必要があります"
 *       }
 *     ]
 *   }
 * }
 * 
 * // Conflict Error Response (409)
 * {
 *   "error": {
 *     "code": "RESOURCE_EMAIL_EXISTS",
 *     "message": "このメールアドレスは既に登録されています",
 *     "statusCode": 409,
 *     "timestamp": "2025-10-24T00:00:00.000Z"
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest, _context) => {
  // 1. リクエストボディのバリデーション
  //    バリデーションエラーは自動でValidationError形式に変換
  const body = await validateRequestBody(request, registerSchema);

  // 2. ユーザー登録処理実行
  //    authService内で EMAIL_EXISTS や USERNAME_EXISTS エラーが
  //    発生した場合も自動処理（AppError として投げる必要あり）
  const { accessToken, refreshToken, user } = await authService.signup(body);

  // 3. 成功レスポンス生成（201 Created）
  const response = successResponse({ user }, { status: 201 });

  // 4. 認証Cookieの設定
  setAuthCookies(response, { accessToken, refreshToken });

  return response;
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（39行）
 * - 手動バリデーション + エラーレスポンス
 * - flattenしたエラー詳細を手動で整形
 * - try-catch ブロック
 * - 個別のエラーチェック（EMAIL_EXISTS, USERNAME_EXISTS）
 * - 手動のエラーレスポンス生成
 * 
 * ## 改善後（18行の実質コード）
 * - validateRequestBody が自動処理
 * - バリデーションエラーの詳細も自動整形
 * - withErrorHandler が自動処理
 * - successResponse で統一フォーマット
 * 
 * ## メリット
 * 1. **コードが54%短縮**: 39行 → 18行
 * 2. **バリデーションメッセージの改善**: より詳細なエラーメッセージ
 * 3. **型安全**: body の型が自動推論される
 * 4. **統一されたエラーフォーマット**: バリデーションエラーも統一
 * 5. **保守性向上**: スキーマ定義に集中できる
 * 
 * ## 注意事項
 * authService.signup() 内で、EMAIL_EXISTS や USERNAME_EXISTS エラーを
 * 投げる際は、AppError を使用する必要があります：
 * 
 * ```typescript
 * // authService.ts 内
 * import { ConflictError } from '@/lib/utils/errors';
 * import { ERROR_CODES } from '@/constants/errors';
 * 
 * if (existingUser) {
 *   throw new ConflictError(ERROR_CODES.RESOURCE.EMAIL_EXISTS);
 * }
 * ```
 */
