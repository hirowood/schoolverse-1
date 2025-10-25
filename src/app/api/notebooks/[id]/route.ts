/**
 * @file [id]/route.ts
 * @description 個別ノートブック操作APIエンドポイント
 * @route GET/PUT/DELETE /api/notebooks/[id]
 * @access Private（認証必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用 + 完全なCRUD実装
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ（全メソッド）
 * ✅ validateRequestBody を使用
 * ✅ successResponse でレスポンス生成
 * ✅ GETメソッドを新規追加
 * ✅ DELETEメソッドを新規追加
 * ✅ PUTメソッドを改善
 * ✅ 統一されたエラーハンドリング
 * ✅ 詳細なドキュメント追加
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { noteService } from '@/services/noteService';
import type { Notebook } from '@prisma/client';
import {
  withErrorHandler,
  validateRequestBody,
  successResponse,
  AuthenticationError,
  NotFoundError,
} from '@/lib/api/errorHandler';

// ============================================
// バリデーションスキーマ
// ============================================

/**
 * ノートブック更新用スキーマ
 */
const updateSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは1文字以上である必要があります')
    .max(100, 'タイトルは100文字以内である必要があります')
    .optional(),
  description: z
    .string()
    .max(500, '説明は500文字以内である必要があります')
    .nullish()
    .optional(),
  tags: z
    .array(z.string().max(20, 'タグは20文字以内である必要があります'))
    .max(20, 'タグは20個まで設定できます')
    .optional(),
  isShared: z
    .boolean()
    .optional(),
});

// ============================================
// ヘルパー関数
// ============================================

/**
 * ノートブックをレスポンス用にマッピング
 */
function toNotebookResponse(notebook: Notebook) {
  return {
    id: notebook.id,
    title: notebook.title,
    description: notebook.description,
    tags: notebook.tags,
    isShared: notebook.isShared,
    ownerId: notebook.ownerId,
    createdAt: notebook.createdAt,
    updatedAt: notebook.updatedAt,
  };
}

/**
 * パラメータからnotebookIdを取得
 */
function getNotebookId(params: { id: string }): string {
  return params.id;
}

// ============================================
// エンドポイント: 個別ノートブック取得
// ============================================

/**
 * 個別ノートブック取得エンドポイント
 * 
 * @description
 * 指定されたIDのノートブックを取得します。
 * 所有者のみがアクセス可能です。
 * 
 * @example
 * ```typescript
 * // Request
 * GET /api/notebooks/notebook-id-123
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "notebook": {
 *       "id": "notebook-id-123",
 *       "title": "Math Notes",
 *       "description": "My math study notes",
 *       "tags": ["math", "study"],
 *       "isShared": false,
 *       "ownerId": "user-id-456",
 *       "createdAt": "2025-10-24T00:00:00.000Z",
 *       "updatedAt": "2025-10-24T00:00:00.000Z"
 *     }
 *   }
 * }
 * 
 * // Not Found Response (404)
 * {
 *   "error": {
 *     "code": "NOTEBOOK_NOT_FOUND",
 *     "message": "ノートブックが見つかりません",
 *     "statusCode": 404
 *   }
 * }
 * ```
 */
export const GET = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    // 0. paramsを取得（Next.js 15対応）
    const params = await context.params;
    
    // 1. 認証チェック
    const auth = requireAuth(request);
    
    if ('error' in auth) {
      throw new AuthenticationError({
        reason: auth.error,
        action: 'get_notebook',
      });
    }

    // 2. notebookId取得
    const notebookId = getNotebookId(params);

    // 3. ノートブック取得（所有者チェック込み）
    //    noteServiceでエラーが発生した場合は自動処理される
    const notebook = await noteService.getNotebook(auth.userId, notebookId);

    // 4. 成功レスポンス生成
    return successResponse({ notebook: toNotebookResponse(notebook) });
  }
);

// ============================================
// エンドポイント: ノートブック更新
// ============================================

/**
 * ノートブック更新エンドポイント
 * 
 * @description
 * 指定されたIDのノートブックを更新します。
 * 所有者のみが更新可能です。
 * 
 * @example
 * ```typescript
 * // Request
 * PUT /api/notebooks/notebook-id-123
 * Content-Type: application/json
 * Cookie: accessToken=...
 * 
 * {
 *   "title": "Updated Math Notes",
 *   "description": "Updated description",
 *   "tags": ["math", "study", "advanced"],
 *   "isShared": true
 * }
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "notebook": {
 *       "id": "notebook-id-123",
 *       "title": "Updated Math Notes",
 *       "description": "Updated description",
 *       "tags": ["math", "study", "advanced"],
 *       "isShared": true,
 *       "ownerId": "user-id-456",
 *       "createdAt": "2025-10-24T00:00:00.000Z",
 *       "updatedAt": "2025-10-24T00:00:01.000Z"
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
 *     "validationErrors": [
 *       {
 *         "field": "title",
 *         "message": "タイトルは100文字以内である必要があります"
 *       }
 *     ]
 *   }
 * }
 * ```
 */
export const PUT = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    // 0. paramsを取得（Next.js 15対応）
    const params = await context.params;
    
    // 1. 認証チェック
    const auth = requireAuth(request);
    
    if ('error' in auth) {
      throw new AuthenticationError({
        reason: auth.error,
        action: 'update_notebook',
      });
    }

    // 2. リクエストボディのバリデーション
    const body = await validateRequestBody(request, updateSchema);

    // 3. notebookId取得
    const notebookId = getNotebookId(params);

    // 4. ノートブック更新
    //    noteService内でエラーが発生した場合も自動処理
    const notebook = await noteService.updateNotebook(auth.userId, {
      notebookId,
      title: body.title,
      description: body.description,
      tags: body.tags,
      isShared: body.isShared,
    });

    // 5. 成功レスポンス生成
    return successResponse({ notebook: toNotebookResponse(notebook) });
  }
);

// ============================================
// エンドポイント: ノートブック削除
// ============================================

/**
 * ノートブック削除エンドポイント
 * 
 * @description
 * 指定されたIDのノートブックを削除します。
 * 所有者のみが削除可能です。
 * 削除は論理削除ではなく物理削除です。
 * 
 * @example
 * ```typescript
 * // Request
 * DELETE /api/notebooks/notebook-id-123
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "message": "ノートブックを削除しました",
 *     "deletedId": "notebook-id-123"
 *   }
 * }
 * 
 * // Not Found Response (404)
 * {
 *   "error": {
 *     "code": "NOTEBOOK_NOT_FOUND",
 *     "message": "ノートブックが見つかりません",
 *     "statusCode": 404
 *   }
 * }
 * ```
 */
export const DELETE = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    // 0. paramsを取得（Next.js 15対応）
    const params = await context.params;
    
    // 1. 認証チェック
    const auth = requireAuth(request);
    
    if ('error' in auth) {
      throw new AuthenticationError({
        reason: auth.error,
        action: 'delete_notebook',
      });
    }

    // 2. notebookId取得
    const notebookId = getNotebookId(params);

    // 3. ノートブック削除（所有者チェック込み）
    //    noteServiceで所有者チェックとカスケード削除を実行
    try {
      await noteService.deleteNotebook(auth.userId, notebookId);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOTEBOOK_NOT_FOUND') {
        throw new NotFoundError('notebook', {
          identifier: notebookId,
        });
      }
      throw error;
    }

    // 4. 成功レスポンス生成

    return successResponse({
      message: 'ノートブックを削除しました',
      deletedId: notebookId,
    });
  }
);

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（38行）
 * - PUTメソッドのみ実装
 * - 手動バリデーション
 * - try-catch ブロック
 * - 手動のエラーレスポンス生成
 * - GET, DELETEメソッドなし
 * 
 * ## 改善後（273行）
 * - GET, PUT, DELETEの完全なCRUD実装
 * - withErrorHandler による統一エラーハンドリング
 * - validateRequestBody による型安全なバリデーション
 * - successResponse による統一フォーマット
 * - 詳細なドキュメントとサンプル
 * 
 * ## メリット
 * 1. **完全なCRUD**: 全てのHTTPメソッドをサポート
 * 2. **統一されたエラーハンドリング**: notebooks/route.tsと同じパターン
 * 3. **型安全**: bodyの型が自動推論される
 * 4. **保守性向上**: ビジネスロジックに集中できる
 * 5. **開発者体験の向上**: 詳細なドキュメントでAPIの使い方が明確
 * 6. **エラーログの自動出力**: デバッグが容易
 * 
 * ## 追加実装
 * - noteService.deleteNotebook() メソッド実装完了
 * - notebookRepository.deleteNotebook() メソッド実装完了
 * - カスケード削除により関連ページも自動削除
 */
