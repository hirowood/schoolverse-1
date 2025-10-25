/**
 * @file route.ts
 * @description チャットルーム一覧取得APIエンドポイント
 * @route GET /api/chat/rooms
 * @access Private（認証必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ AuthenticationError で統一
 * ✅ successResponse でレスポンス生成
 * ✅ try-catch の削除
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { chatService } from '@/services/chatService';
import {
  withErrorHandler,
  successResponse,
  AuthenticationError,
} from '@/lib/api/errorHandler';

// ============================================
// エンドポイント
// ============================================

/**
 * チャットルーム一覧取得エンドポイント
 * 
 * @description
 * 認証済みユーザーが参加しているチャットルームの一覧を取得します。
 * 
 * @example
 * ```typescript
 * // Request
 * GET /api/chat/rooms
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "rooms": [
 *       {
 *         "id": "room-id-1",
 *         "name": "General",
 *         "type": "PUBLIC",
 *         "memberCount": 5,
 *         "lastMessageAt": "2025-10-24T00:00:00.000Z"
 *       },
 *       {
 *         "id": "room-id-2",
 *         "name": "Private Chat",
 *         "type": "DIRECT",
 *         "memberCount": 2,
 *         "lastMessageAt": "2025-10-23T23:00:00.000Z"
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
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 1. 認証チェック
  const auth = requireAuth(request);
  
  if ('error' in auth) {
    throw new AuthenticationError({
      reason: auth.error,
      action: 'list_chat_rooms',
    });
  }

  // 2. チャットルーム一覧取得
  //    chatService内でエラーが発生した場合も自動処理
  const rooms = await chatService.listRoomsForUser(auth.userId);

  // 3. 成功レスポンス生成
  return successResponse({ rooms });
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（16行）
 * - 手動の認証チェック
 * - try-catch ブロック
 * - 手動のエラーレスポンス生成
 * - コンソールログのみ
 * 
 * ## 改善後（19行の実質コード）
 * - withErrorHandler でラップ
 * - AuthenticationError で統一
 * - successResponse で統一フォーマット
 * - エラーログ自動出力
 * 
 * ## メリット
 * 1. **コードが簡潔**: try-catch 不要
 * 2. **エラーの統一**: 統一されたエラーフォーマット
 * 3. **型安全**: エラーレスポンスの型が保証される
 * 4. **ログの自動出力**: エラー時のログが自動で記録される
 */
