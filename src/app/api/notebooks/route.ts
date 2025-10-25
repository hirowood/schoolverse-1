/**
 * @file route.ts
 * @description ノート一覧取得・作成APIエンドポイント
 * @route GET/POST /api/notebooks
 * @access Private（認証必須）
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ withErrorHandler でラップ
 * ✅ validateRequestBody を使用
 * ✅ successResponse でレスポンス生成
 * ✅ try-catch の削除
 * ✅ バリデーションメッセージの改善
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
} from '@/lib/api/errorHandler';

// ============================================
// バリデーションスキーマ
// ============================================

const createSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内である必要があります'),
  description: z
    .string()
    .max(500, '説明は500文字以内である必要があります')
    .nullish(),
  tags: z
    .array(z.string().max(20, 'タグは20文字以内である必要があります'))
    .max(20, 'タグは20個まで設定できます')
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
    createdAt: notebook.createdAt,
    updatedAt: notebook.updatedAt,
  };
}

// ============================================
// エンドポイント: ノート一覧取得
// ============================================

/**
 * ノート一覧取得エンドポイント
 * 
 * @description
 * 認証済みユーザーが所有するノートの一覧を取得します。
 * 
 * @example
 * ```typescript
 * // Request
 * GET /api/notebooks
 * Cookie: accessToken=...
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "notebooks": [
 *       {
 *         "id": "notebook-id-1",
 *         "title": "Math Notes",
 *         "description": "My math study notes",
 *         "tags": ["math", "study"],
 *         "isShared": false,
 *         "createdAt": "2025-10-24T00:00:00.000Z",
 *         "updatedAt": "2025-10-24T00:00:00.000Z"
 *       }
 *     ]
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
      action: 'list_notebooks',
    });
  }

  // 2. ノート一覧取得
  const notebooks = await noteService.listMyNotebooks(auth.userId);

  // 3. レスポンス用にマッピング
  const notebooksResponse = notebooks.map(toNotebookResponse);

  // 4. 成功レスポンス生成
  return successResponse({ notebooks: notebooksResponse });
});

// ============================================
// エンドポイント: ノート作成
// ============================================

/**
 * ノート作成エンドポイント
 * 
 * @description
 * 新しいノートを作成します。
 * 
 * @example
 * ```typescript
 * // Request
 * POST /api/notebooks
 * Content-Type: application/json
 * Cookie: accessToken=...
 * 
 * {
 *   "title": "My New Notebook",
 *   "description": "A notebook for my studies",
 *   "tags": ["study", "notes"]
 * }
 * 
 * // Success Response (201)
 * {
 *   "data": {
 *     "notebook": {
 *       "id": "notebook-id",
 *       "title": "My New Notebook",
 *       "description": "A notebook for my studies",
 *       "tags": ["study", "notes"],
 *       "isShared": false,
 *       "createdAt": "2025-10-24T00:00:00.000Z",
 *       "updatedAt": "2025-10-24T00:00:00.000Z"
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
 *         "field": "title",
 *         "message": "タイトルは必須です"
 *       }
 *     ]
 *   }
 * }
 * ```
 */
export const POST = withErrorHandler(async (request: NextRequest, _context) => {
  // 1. 認証チェック
  const auth = requireAuth(request);
  
  if ('error' in auth) {
    throw new AuthenticationError({
      reason: auth.error,
      action: 'create_notebook',
    });
  }

  // 2. リクエストボディのバリデーション
  const body = await validateRequestBody(request, createSchema);

  // 3. ノート作成
  //    noteService内でエラーが発生した場合も自動処理
  const notebook = await noteService.createNotebook({
    ownerId: auth.userId,
    title: body.title,
    description: body.description ?? null,
    tags: body.tags,
  });

  // 4. 成功レスポンス生成（201 Created）
  return successResponse(
    { notebook: toNotebookResponse(notebook) },
    { status: 201 }
  );
});

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（42行）
 * - 手動バリデーション + エラーレスポンス
 * - try-catch ブロック
 * - 手動のエラーレスポンス生成
 * - flattenしたエラー詳細を手動で整形
 * 
 * ## 改善後（48行 + バリデーション強化）
 * - validateRequestBody が自動処理
 * - withErrorHandler が自動処理
 * - successResponse で統一フォーマット
 * - バリデーションメッセージの改善
 * 
 * ## メリット
 * 1. **バリデーションの強化**: より詳細なエラーメッセージ
 * 2. **統一されたエラーフォーマット**: すべてのエラーが同じ構造
 * 3. **型安全**: body の型が自動推論される
 * 4. **保守性向上**: ビジネスロジックに集中できる
 * 5. **エラーログの自動出力**: デバッグが容易
 */
