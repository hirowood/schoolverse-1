/**
 * @file notebook.factory.ts
 * @description ノートブックテストデータファクトリー
 * @created 2025-10-24
 * 
 * 【機能】
 * - テスト用ノートブックデータの生成
 * - テスト用ノートブックページデータの生成
 * - カスタマイズ可能なファクトリー関数
 */

import type { Notebook, NotebookPage } from '@prisma/client';
import { randomId, testTimestamp } from '../helpers/api.helper';

// ============================================
// Notebook ファクトリー
// ============================================

/**
 * テスト用ノートブックを生成
 * 
 * @param overrides - 上書きするプロパティ
 * @returns テスト用ノートブック
 * 
 * @example
 * ```typescript
 * const notebook = createMockNotebook({
 *   title: 'Custom Title',
 *   ownerId: 'user-123',
 * });
 * ```
 */
export function createMockNotebook(
  overrides?: Partial<Notebook>
): Notebook {
  const id = overrides?.id || randomId();
  const ownerId = overrides?.ownerId || randomId();
  const createdAt = overrides?.createdAt || testTimestamp();
  const updatedAt = overrides?.updatedAt || testTimestamp();

  return {
    id,
    title: 'Test Notebook',
    description: 'Test description',
    tags: ['test', 'mock'],
    isShared: false,
    ownerId,
    createdAt,
    updatedAt,
    ...overrides,
  };
}

/**
 * 複数のテスト用ノートブックを生成
 * 
 * @param count - 生成する数
 * @param overrides - 上書きするプロパティ
 * @returns テスト用ノートブック配列
 */
export function createMockNotebooks(
  count: number,
  overrides?: Partial<Notebook>
): Notebook[] {
  return Array.from({ length: count }, (_, i) =>
    createMockNotebook({
      ...overrides,
      id: overrides?.id || `notebook-${i}`,
      title: overrides?.title || `Test Notebook ${i + 1}`,
    })
  );
}

// ============================================
// NotebookPage ファクトリー
// ============================================

/**
 * テスト用ノートブックページを生成
 * 
 * @param overrides - 上書きするプロパティ
 * @returns テスト用ノートブックページ
 */
export function createMockNotebookPage(
  overrides?: Partial<NotebookPage>
): NotebookPage {
  const id = overrides?.id || randomId();
  const notebookId = overrides?.notebookId || randomId();
  const createdAt = overrides?.createdAt || testTimestamp();
  const updatedAt = overrides?.updatedAt || testTimestamp();

  return {
    id,
    notebookId,
    pageNumber: 1,
    vectorJson: null,
    pdfAssetId: null,
    createdAt,
    updatedAt,
    ...overrides,
  };
}

/**
 * 複数のテスト用ノートブックページを生成
 * 
 * @param count - 生成する数
 * @param overrides - 上書きするプロパティ
 * @returns テスト用ノートブックページ配列
 */
export function createMockNotebookPages(
  count: number,
  overrides?: Partial<NotebookPage>
): NotebookPage[] {
  return Array.from({ length: count }, (_, i) =>
    createMockNotebookPage({
      ...overrides,
      id: overrides?.id || `page-${i}`,
      pageNumber: overrides?.pageNumber || i + 1,
    })
  );
}

// ============================================
// 複合データファクトリー
// ============================================

/**
 * ページを含むノートブックを生成
 * 
 * @param pageCount - ページ数
 * @param overrides - 上書きするプロパティ
 * @returns ページを含むノートブック
 */
export function createMockNotebookWithPages(
  pageCount: number = 3,
  overrides?: Partial<Notebook>
): Notebook & { pages: NotebookPage[] } {
  const notebook = createMockNotebook(overrides);
  const pages = createMockNotebookPages(pageCount, {
    notebookId: notebook.id,
  });

  return {
    ...notebook,
    pages,
  };
}

// ============================================
// リクエストボディファクトリー
// ============================================

/**
 * ノートブック作成リクエストボディを生成
 */
export function createNotebookRequestBody(
  overrides?: {
    title?: string;
    description?: string | null;
    tags?: string[];
  }
) {
  return {
    title: 'New Notebook',
    description: 'New description',
    tags: ['new', 'test'],
    ...overrides,
  };
}

/**
 * ノートブック更新リクエストボディを生成
 */
export function updateNotebookRequestBody(
  overrides?: {
    title?: string;
    description?: string | null;
    tags?: string[];
    isShared?: boolean;
  }
) {
  return {
    title: 'Updated Notebook',
    description: 'Updated description',
    tags: ['updated', 'test'],
    isShared: true,
    ...overrides,
  };
}
