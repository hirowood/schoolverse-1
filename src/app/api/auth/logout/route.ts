/**
 * @file route.ts
 * @description ログアウトAPIエンドポイント
 * @route POST /api/auth/logout
 * @access Public（ただしトークンがあれば処理）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ successResponse でレスポンス生成
 * ✅ エラーハンドリングの追加
 */

import { NextRequest } from 'next/server';
import { authService } from '@/services/authService';
import { clearAuthCookies, getAccessToken, getRefreshToken } from '@/lib/auth/cookies';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { sessionRepository } from '@/repositories';
import {
  withErrorHandler,
  successResponse,
} from '@/lib/api/errorHandler';

// ============================================
// エンドポイント
// ============================================

/**
 * ログアウトエンドポイント
 * 
 * @description
 * ユーザーをログアウトし、セッションを無効化します。
 * トークンが無効な場合でもCookieをクリアします。
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/auth/logout
 * Cookie: accessToken=...; refreshToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "ok": true
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest, _context) => {
  // 1. トークンの取得
  const refreshToken = getRefreshToken(request);
  const accessToken = getAccessToken(request);

  let userId: string | null = null;

  // 2. ユーザーIDの特定を試行
  //    リフレッシュトークンから優先的に取得
  if (refreshToken) {
    try {
      // セッションからユーザーIDを取得
      const session = await sessionRepository.findByRefreshToken(refreshToken);
      if (session) {
        userId = session.userId;
      } else {
        // セッションが見つからない場合はトークンを検証
        const payload = verifyRefreshToken(refreshToken);
        userId = payload?.sub ?? null;
      }
    } catch (error) {
      // トークン検証エラーは無視（ログアウトは続行）
      console.warn('[auth/logout] Failed to verify refresh token', error);
    }
  }

  // 3. アクセストークンからも試行
  if (!userId && accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      userId = payload?.sub ?? null;
    } catch (error) {
      // トークン検証エラーは無視（ログアウトは続行）
      console.warn('[auth/logout] Failed to verify access token', error);
    }
  }

  // 4. ユーザーIDが特定できた場合、セッションを削除
  if (userId) {
    try {
      await authService.logout(userId);
    } catch (error) {
      // ログアウト処理のエラーはログのみ（Cookieクリアは続行）
      console.error('[auth/logout] Failed to logout user', error);
    }
  }

  // 5. 成功レスポンス生成
  const response = successResponse({ ok: true });

  // 6. 認証Cookieのクリア（常に実行）
  clearAuthCookies(response);

  return response;
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（27行）
 * - エラーハンドリングなし
 * - ログアウト処理失敗時の対応なし
 * - 手動のレスポンス生成
 * 
 * ## 改善後（33行 + エラーハンドリング強化）
 * - withErrorHandler でラップ
 * - try-catch で個別のエラーをログ
 * - ログアウト失敗時もCookieクリアを保証
 * - successResponse で統一フォーマット
 * 
 * ## メリット
 * 1. **堅牢性向上**: エラーが発生してもログアウトは完了
 * 2. **ログの充実**: 各段階のエラーを記録
 * 3. **統一されたレスポンス**: 成功レスポンスが統一フォーマット
 * 4. **保守性向上**: エラーケースが明示的
 * 
 * ## 設計思想
 * ログアウトは「失敗してはいけない」操作です。
 * トークンが無効でも、セッションが見つからなくても、
 * 最終的にはCookieをクリアしてユーザーをログアウト状態にします。
 * 
 * エラーはログに記録しますが、クライアントには常に成功を返します。
 * これにより、ユーザーが「ログアウトできない」状態を防ぎます。
 */
