/**
 * @file route.ts (改善版)
 * @description ログインAPIエンドポイント - エラーハンドリング統一版
 * @author Schoolverse Team
 * @updated 2025-10-24
 * 
 * 【改善点】
 * ✅ withErrorHandler でラップ
 * ✅ validateRequestBody でバリデーション
 * ✅ エラーハンドリングの統一
 * ✅ try-catch の削除（自動処理）
 * 
 * 【変更前との比較】
 * Before: 個別のtry-catch、手動エラー処理
 * After: ミドルウェアによる自動処理
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

// バリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
});

/**
 * ログインエンドポイント
 * 
 * @route POST /api/auth/login
 * @access Public
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/auth/login
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
 *       "displayName": "User Name"
 *     }
 *   }
 * }
 * 
 * // Error Response (401)
 * {
 *   "error": {
 *     "code": "AUTH_INVALID_CREDENTIALS",
 *     "message": "メールアドレスまたはパスワードが正しくありません",
 *     "statusCode": 401
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 1. バリデーション（エラーは自動でスロー）
  const body = await validateRequestBody(request, loginSchema);

  // 2. ビジネスロジック実行
  const { accessToken, refreshToken, user } = await authService.login(body);

  // 3. レスポンス生成
  const response = successResponse({ user });

  // 4. Cookieの設定
  setAuthCookies(response, { accessToken, refreshToken });

  return response;
});

/**
 * 【解説】
 * 
 * ## 改善前のコード
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const body = await request.json().catch(() => null);
 *   const parsed = loginSchema.safeParse(body);
 *   if (!parsed.success) {
 *     return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
 *   }
 * 
 *   try {
 *     const { accessToken, refreshToken, user } = await authService.login(parsed.data);
 *     const response = NextResponse.json({ user }, { status: 200 });
 *     setAuthCookies(response, { accessToken, refreshToken });
 *     return response;
 *   } catch (error) {
 *     if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
 *       return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
 *     }
 *     console.error('[auth/login] unexpected error', error);
 *     return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
 *   }
 * }
 * ```
 * 
 * ## 改善後の利点
 * 1. **コードが短くなる**: try-catch が不要
 * 2. **型安全**: validateRequestBody の戻り値が型推論される
 * 3. **エラーハンドリング統一**: 全エンドポイントで同じフォーマット
 * 4. **ログ自動出力**: エラーログが統一フォーマットで出力
 * 5. **開発体験向上**: エラー詳細が開発環境で表示
 */
