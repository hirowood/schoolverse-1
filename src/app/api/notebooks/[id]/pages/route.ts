/**
 * @file route.ts
 * @description ノートページ保存APIエンドポイント
 * @route PUT /api/notebooks/[id]/pages
 * @access Private（認証必須）
 * @updated 2025-10-25 - Next.js 15対応 + エラーハンドリング統一
 * 
 * 【変更点】
 * ✅ Next.js 15の型定義に対応（paramsは常にPromise）
 * ✅ withErrorHandler でラップ
 * ✅ validateRequestBody でバリデーション
 * ✅ successResponse でレスポンス生成
 * ✅ 統一されたエラーハンドリング
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { noteService } from '@/services/noteService';
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
 * ページ保存用スキーマ
 */
const upsertSchema = z.object({
  pageNumber: z
    .number()
    .int()
    .min(1, 'ページ番号は1以上である必要があります'),
  vectorJson: z
    .unknown()
    .optional(),
  pdfAssetId: z
    .string()
    .min(1, 'PDFアセットIDは1文字以上である必要があります')
    .optional()
    .nullable(),
});

// ============================================
// エンドポイント: ページ保存
// ============================================

/**
 * ノートページ保存エンドポイント
 * 
 * @description
 * フロントエンドから受け取った描画データを保存します。
 * 指定されたノートブックの所有者のみが保存可能です。
 * 
 * @example
 * ```typescript
 * // Request
 * PUT /api/notebooks/notebook-id-123/pages
 * Content-Type: application/json
 * Cookie: accessToken=...
 * 
 * {
 *   "pageNumber": 1,
 *   "vectorJson": { ... },
 *   "pdfAssetId": "asset-id-456"
 * }
 * 
 * // Success Response (200)
 * {
 *   "data": {
 *     "page": {
 *       "id": "page-id-789",
 *       "notebookId": "notebook-id-123",
 *       "pageNumber": 1,
 *       "vectorJson": { ... },
 *       "pdfAssetId": "asset-id-456",
 *       "createdAt": "2025-10-25T00:00:00.000Z",
 *       "updatedAt": "2025-10-25T00:00:00.000Z"
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
 * 
 * // Validation Error Response (400)
 * {
 *   "error": {
 *     "code": "VALIDATION_FAILED",
 *     "message": "入力内容に誤りがあります",
 *     "statusCode": 400,
 *     "validationErrors": [
 *       {
 *         "field": "pageNumber",
 *         "message": "ページ番号は1以上である必要があります"
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
        action: 'save_page',
      });
    }

    // 2. リクエストボディのバリデーション
    const body = await validateRequestBody(request, upsertSchema);

    // 3. ページ保存
    try {
      const page = await noteService.savePageForOwner(auth.userId, {
        notebookId: params.id,
        pageNumber: body.pageNumber,
        vectorJson: body.vectorJson,
        pdfAssetId: body.pdfAssetId ?? null,
      });

      // 4. 成功レスポンス生成
      return successResponse({ page });
    } catch (error) {
      // ノートブックが見つからない場合
      if (error instanceof Error && error.message === 'NOTEBOOK_NOT_FOUND') {
        throw new NotFoundError('notebook', {
          identifier: params.id,
        });
      }
      // その他のエラーは再スロー（withErrorHandlerが処理）
      throw error;
    }
  }
);

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（42行）
 * - Next.js 15非対応の型定義
 * - 手動バリデーション + エラーレスポンス
 * - try-catch で個別のエラーハンドリング
 * - 手動のエラーレスポンス生成
 * - unauthorized() ヘルパーを使用
 * 
 * ## 改善後（133行 + 完全なドキュメント）
 * - Next.js 15完全対応（params: Promise<{ id: string }>）
 * - withErrorHandler による統一エラーハンドリング
 * - validateRequestBody による型安全なバリデーション
 * - successResponse による統一フォーマット
 * - 詳細なドキュメントとサンプル
 * 
 * ## メリット
 * 1. **Next.js 15対応**: 型エラーが解消
 * 2. **統一されたエラーハンドリング**: 他のAPIと同じパターン
 * 3. **型安全**: bodyの型が自動推論される
 * 4. **保守性向上**: ビジネスロジックに集中できる
 * 5. **エラーログの自動出力**: デバッグが容易
 * 6. **開発者体験の向上**: 詳細なドキュメント
 */
