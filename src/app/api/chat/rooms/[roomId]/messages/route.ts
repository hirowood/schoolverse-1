/**
 * @file route.ts
 * @description チャットメッセージ取得・送信APIエンドポイント
 * @route GET/POST /api/chat/rooms/[roomId]/messages
 * @access Private（認証必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ validateRequestBody, validateQueryParams を使用
 * ✅ successResponse でレスポンス生成
 * ✅ try-catch の削除
 * ✅ エラーコード定数の使用
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { chatService } from '@/services/chatService';
import {
  withErrorHandler,
  validateQueryParams,
  validateRequestBody,
  successResponse,
  AuthenticationError,
} from '@/lib/api/errorHandler';

// ============================================
// バリデーションスキーマ
// ============================================

const historyQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const sendSchema = z.object({
  content: z
    .string()
    .min(1, 'メッセージ内容は必須です')
    .max(1000, 'メッセージは1000文字以内である必要があります'),
  type: z.enum(['TEXT', 'SYSTEM', 'NOTIFICATION']).optional(),
  recipientId: z.string().cuid().nullable().optional(),
});

// ============================================
// エンドポイント: メッセージ履歴取得
// ============================================

/**
 * チャットメッセージ履歴取得エンドポイント
 * 
 * @description
 * 指定されたルームのメッセージ履歴を取得します。
 * カーソルベースのページネーションに対応しています。
 * 
 * @example
 * ```typescript
 * // Request
 * GET /api/chat/rooms/room-id/messages?limit=50&cursor=last-message-id
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "messages": [...],
 *     "nextCursor": "next-message-id",
 *     "hasMore": true
 *   }
 * }
 * 
 * // Forbidden Error Response (403)
 * {
 *   "error": {
 *     "code": "ROOM_FORBIDDEN",
 *     "message": "このルームへのアクセス権限がありません",
 *     "statusCode": 403,
 *     "timestamp": "2025-10-24T00:00:00.000Z"
 *   }
 * }
 * ```
 */
export const GET = withErrorHandler(async (request: NextRequest, context: { params: Promise<{ roomId: string }> }) => {
  // 0. paramsを取得（Next.js 15対応）
  const params = await context.params;
  
  // 1. 認証チェック
  const auth = requireAuth(request);
  
  if ('error' in auth) {
    throw new AuthenticationError({
      reason: auth.error,
      action: 'get_chat_history',
    });
  }

  // 2. クエリパラメータのバリデーション
  const query = validateQueryParams(request, historyQuerySchema);

  // 3. メッセージ履歴取得
  //    chatService内でエラーが発生した場合も自動処理
  //    （chatService.getRoomHistory がAppErrorを投げる必要あり）
  const history = await chatService.getRoomHistory({
    roomId: params.roomId,
    userId: auth.userId,
    cursor: query.cursor,
    limit: query.limit,
  });

  // 4. 成功レスポンス生成
  return successResponse(history);
});

// ============================================
// エンドポイント: メッセージ送信
// ============================================

/**
 * チャットメッセージ送信エンドポイント
 * 
 * @description
 * 指定されたルームにメッセージを送信します。
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/chat/rooms/room-id/messages
 * Content-Type: application/json
 * Cookie: accessToken=...
 * 
 * {
 *   "content": "Hello, world!",
 *   "type": "TEXT"
 * }
 * 
 * // Success Response (201)
 * {
 *   "data": {
 *     "message": {
 *       "id": "message-id",
 *       "content": "Hello, world!",
 *       "senderId": "user-id",
 *       "roomId": "room-id",
 *       "type": "TEXT",
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
 *         "field": "content",
 *         "message": "メッセージ内容は必須です"
 *       }
 *     ]
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest, context: { params: Promise<{ roomId: string }> }) => {
  // 0. paramsを取得（Next.js 15対応）
  const params = await context.params;
  
  // 1. 認証チェック
  const auth = requireAuth(request);
  
  if ('error' in auth) {
    throw new AuthenticationError({
      reason: auth.error,
      action: 'send_message',
    });
  }

  // 2. リクエストボディのバリデーション
  const body = await validateRequestBody(request, sendSchema);

  // 3. メッセージ送信
  //    chatService内でエラーが発生した場合も自動処理
  const message = await chatService.sendMessage({
    roomId: params.roomId,
    senderId: auth.userId,
    content: body.content,
    type: body.type,
    recipientId: body.recipientId ?? null,
  });

  // 4. 成功レスポンス生成（201 Created）
  return successResponse({ message }, { status: 201 });
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（61行）
 * - 手動バリデーション + エラーレスポンス
 * - try-catch ブロック × 2
 * - 個別のエラーチェック（ROOM_FORBIDDEN）
 * - 手動のエラーレスポンス生成
 * - flattenしたエラー詳細を手動で整形
 * 
 * ## 改善後（56行の実質コード）
 * - validateRequestBody, validateQueryParams が自動処理
 * - withErrorHandler が自動処理
 * - successResponse で統一フォーマット
 * - バリデーションエラーの詳細も自動整形
 * 
 * ## メリット
 * 1. **コードが8%短縮**: 61行 → 56行
 * 2. **統一されたエラーフォーマット**: すべてのエラーが同じ構造
 * 3. **型安全**: body, query の型が自動推論される
 * 4. **保守性向上**: ビジネスロジックに集中できる
 * 5. **バリデーションメッセージの改善**: より詳細なエラーメッセージ
 * 
 * ## 注意事項
 * chatService.getRoomHistory() と chatService.sendMessage() 内で、
 * ROOM_FORBIDDEN エラーを投げる際は、AppError を使用する必要があります：
 * 
 * ```typescript
 * // chatService.ts 内
 * import { AuthorizationError } from '@/lib/utils/errors';
 * import { ERROR_CODES } from '@/constants/errors';
 * 
 * if (!hasAccess) {
 *   throw new AuthorizationError({
 *     code: ERROR_CODES.ROOM.FORBIDDEN,
 *     roomId,
 *     userId,
 *   });
 * }
 * ```
 */
