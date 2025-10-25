/**
 * @file noteService.mock.ts
 * @description noteService のモック
 * @created 2025-10-24
 */

import { vi } from 'vitest';
import type { Notebook, NotebookPage } from '@prisma/client';
import {
  createMockNotebook,
  createMockNotebooks,
  createMockNotebookWithPages,
} from '../factories/notebook.factory';

// ============================================
// noteService モック
// ============================================

/**
 * noteService.createNotebook のモック
 */
export const mockCreateNotebook = vi.fn(
  async (input: {
    ownerId: string;
    title: string;
    description?: string | null;
    tags?: string[];
  }): Promise<Notebook> => {
    return createMockNotebook({
      ownerId: input.ownerId,
      title: input.title,
      description: input.description ?? null,
      tags: input.tags ?? [],
    });
  }
);

/**
 * noteService.listMyNotebooks のモック
 */
export const mockListMyNotebooks = vi.fn(
  async (ownerId: string): Promise<Notebook[]> => {
    return createMockNotebooks(3, { ownerId });
  }
);

/**
 * noteService.getNotebook のモック
 */
export const mockGetNotebook = vi.fn(
  async (
    ownerId: string,
    notebookId: string
  ): Promise<Notebook & { pages: NotebookPage[] }> => {
    return createMockNotebookWithPages(3, {
      id: notebookId,
      ownerId,
    });
  }
);

/**
 * noteService.updateNotebook のモック
 */
export const mockUpdateNotebook = vi.fn(
  async (
    ownerId: string,
    payload: {
      notebookId: string;
      title?: string;
      description?: string | null;
      tags?: string[];
      isShared?: boolean;
    }
  ): Promise<Notebook> => {
    return createMockNotebook({
      id: payload.notebookId,
      ownerId,
      title: payload.title,
      description: payload.description,
      tags: payload.tags,
      isShared: payload.isShared,
    });
  }
);

/**
 * noteService.deleteNotebook のモック
 */
export const mockDeleteNotebook = vi.fn(
  async (ownerId: string, notebookId: string): Promise<Notebook> => {
    return createMockNotebook({
      id: notebookId,
      ownerId,
    });
  }
);

// ============================================
// エラーシミュレーション
// ============================================

/**
 * NOTEBOOK_NOT_FOUND エラーをシミュレート
 */
export function mockNotebookNotFoundError() {
  const error = new Error('NOTEBOOK_NOT_FOUND');
  
  mockGetNotebook.mockRejectedValueOnce(error);
  mockUpdateNotebook.mockRejectedValueOnce(error);
  mockDeleteNotebook.mockRejectedValueOnce(error);
}

/**
 * データベースエラーをシミュレート
 */
export function mockDatabaseError() {
  const error = new Error('Database error');
  
  mockCreateNotebook.mockRejectedValueOnce(error);
  mockListMyNotebooks.mockRejectedValueOnce(error);
  mockGetNotebook.mockRejectedValueOnce(error);
  mockUpdateNotebook.mockRejectedValueOnce(error);
  mockDeleteNotebook.mockRejectedValueOnce(error);
}

// ============================================
// モックリセット
// ============================================

/**
 * すべてのモックをリセット
 */
export function resetNoteServiceMocks() {
  mockCreateNotebook.mockClear();
  mockListMyNotebooks.mockClear();
  mockGetNotebook.mockClear();
  mockUpdateNotebook.mockClear();
  mockDeleteNotebook.mockClear();
}

/**
 * モックされた noteService
 */
export const mockNoteService = {
  createNotebook: mockCreateNotebook,
  listMyNotebooks: mockListMyNotebooks,
  getNotebook: mockGetNotebook,
  updateNotebook: mockUpdateNotebook,
  deleteNotebook: mockDeleteNotebook,
};
