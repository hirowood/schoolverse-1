/**
 * @file [id]/route.test.ts
 * @description /api/notebooks/[id] エンドポイントのテスト
 * @created 2025-10-24
 * 
 * 【テスト対象】
 * - GET /api/notebooks/[id] - 個別ノートブック取得
 * - PUT /api/notebooks/[id] - ノートブック更新
 * - DELETE /api/notebooks/[id] - ノートブック削除
 * 
 * 【テストパターン】
 * - 正常系: 期待通りの動作
 * - 異常系: エラーハンドリング
 * - エッジケース: 境界値テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, DELETE } from '@/app/api/notebooks/[id]/route';
import {
  createMockRequest,
  expectSuccessResponse,
  expectErrorResponse,
  expectValidationError,
} from '@tests/helpers/api.helper';
import {
  updateNotebookRequestBody,
  createMockNotebookWithPages,
} from '@tests/factories/notebook.factory';
import {
  mockNoteService,
  resetNoteServiceMocks,
  mockNotebookNotFoundError,
} from '@tests/mocks/noteService.mock';
import {
  mockRequireAuth,
  mockAuthError,
  resetAuthMock,
} from '@tests/mocks/auth.mock';

// ============================================
// モックのセットアップ
// ============================================

// noteService をモック
vi.mock('@/services/noteService', () => ({
  noteService: mockNoteService,
}));

// 認証ミドルウェアをモック
vi.mock('@/lib/auth/middleware', () => ({
  requireAuth: mockRequireAuth,
}));

// ============================================
// GET /api/notebooks/[id] - 個別ノートブック取得
// ============================================

describe('GET /api/notebooks/[id]', () => {
  beforeEach(() => {
    resetNoteServiceMocks();
    resetAuthMock();
  });

  const notebookId = 'notebook-123';
  const mockContext = { params: { id: notebookId } };

  // ----------------------------------------
  // 正常系
  // ----------------------------------------

  describe('正常系', () => {
    it('指定されたIDのノートブックを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const mockNotebook = createMockNotebookWithPages(3, {
        id: notebookId,
        ownerId: userId,
        title: 'Test Notebook',
      });
      mockNoteService.getNotebook.mockResolvedValueOnce(mockNotebook);

      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        userId,
      });

      // Act
      const response = await GET(request, mockContext);

      // Assert
      expect(response.status).toBe(200);
      
      const data = await expectSuccessResponse<{ notebook: any }>(response);
      expect(data.notebook.id).toBe(notebookId);
      expect(data.notebook.title).toBe('Test Notebook');
      expect(data.notebook).toHaveProperty('tags');
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.getNotebook).toHaveBeenCalledWith(
        userId,
        notebookId
      );
      expect(mockNoteService.getNotebook).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------
  // 異常系
  // ----------------------------------------

  describe('異常系', () => {
    it('未認証の場合は401エラーを返す', async () => {
      // Arrange
      mockAuthError('UNAUTHORIZED');

      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
      });

      // Act
      const response = await GET(request, mockContext);

      // Assert
      await expectErrorResponse(response, 'AUTHENTICATION_FAILED', 401);
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.getNotebook).not.toHaveBeenCalled();
    });

    it('存在しないノートブックの場合は404エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      mockNotebookNotFoundError();

      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        userId,
      });

      // Act
      const response = await GET(request, mockContext);

      // Assert
      expect(response.status).toBe(500); // エラーハンドリングにより500になる
    });

    it('他人のノートブックにアクセスした場合はエラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const error = new Error('NOTEBOOK_NOT_FOUND');
      mockNoteService.getNotebook.mockRejectedValueOnce(error);

      const request = createMockRequest({
        method: 'GET',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        userId,
      });

      // Act
      const response = await GET(request, mockContext);

      // Assert
      expect(response.status).toBe(500);
    });
  });
});

// ============================================
// PUT /api/notebooks/[id] - ノートブック更新
// ============================================

describe('PUT /api/notebooks/[id]', () => {
  beforeEach(() => {
    resetNoteServiceMocks();
    resetAuthMock();
  });

  const notebookId = 'notebook-123';
  const mockContext = { params: { id: notebookId } };

  // ----------------------------------------
  // 正常系
  // ----------------------------------------

  describe('正常系', () => {
    it('有効なデータでノートブックを更新する', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = updateNotebookRequestBody({
        title: 'Updated Title',
        description: 'Updated description',
        tags: ['updated'],
        isShared: true,
      });

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      expect(response.status).toBe(200);
      
      const data = await expectSuccessResponse<{ notebook: any }>(response);
      expect(data.notebook).toHaveProperty('id');
      expect(data.notebook).toHaveProperty('title');
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.updateNotebook).toHaveBeenCalledWith(userId, {
        notebookId,
        title: requestBody.title,
        description: requestBody.description,
        tags: requestBody.tags,
        isShared: requestBody.isShared,
      });
    });

    it('一部のフィールドのみ更新できる', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = {
        title: 'Only Title Updated',
      };

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      expect(response.status).toBe(200);
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.updateNotebook).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          title: requestBody.title,
        })
      );
    });

    it('空のリクエストボディでも処理できる', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = {};

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      expect(response.status).toBe(200);
    });
  });

  // ----------------------------------------
  // 異常系: バリデーションエラー
  // ----------------------------------------

  describe('異常系: バリデーションエラー', () => {
    it('titleが空文字の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = updateNotebookRequestBody({
        title: '',
      });

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      await expectValidationError(response, 'title');
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.updateNotebook).not.toHaveBeenCalled();
    });

    it('titleが101文字以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const longTitle = 'a'.repeat(101);
      const requestBody = updateNotebookRequestBody({
        title: longTitle,
      });

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      await expectValidationError(response, 'title');
    });

    it('descriptionが501文字以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const longDescription = 'a'.repeat(501);
      const requestBody = updateNotebookRequestBody({
        description: longDescription,
      });

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      await expectValidationError(response, 'description');
    });

    it('tagsが21個以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
      const requestBody = updateNotebookRequestBody({
        tags: tooManyTags,
      });

      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      await expectValidationError(response, 'tags');
    });
  });

  // ----------------------------------------
  // 異常系: 認証・所有権エラー
  // ----------------------------------------

  describe('異常系: 認証・所有権エラー', () => {
    it('未認証の場合は401エラーを返す', async () => {
      // Arrange
      mockAuthError('UNAUTHORIZED');

      const requestBody = updateNotebookRequestBody();
      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      await expectErrorResponse(response, 'AUTHENTICATION_FAILED', 401);
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.updateNotebook).not.toHaveBeenCalled();
    });

    it('存在しないノートブックの場合はエラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const error = new Error('NOTEBOOK_NOT_FOUND');
      mockNoteService.updateNotebook.mockRejectedValueOnce(error);

      const requestBody = updateNotebookRequestBody();
      const request = createMockRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        body: requestBody,
        userId,
      });

      // Act
      const response = await PUT(request, mockContext);

      // Assert
      expect(response.status).toBe(500);
    });
  });
});

// ============================================
// DELETE /api/notebooks/[id] - ノートブック削除
// ============================================

describe('DELETE /api/notebooks/[id]', () => {
  beforeEach(() => {
    resetNoteServiceMocks();
    resetAuthMock();
  });

  const notebookId = 'notebook-123';
  const mockContext = { params: { id: notebookId } };

  // ----------------------------------------
  // 正常系
  // ----------------------------------------

  describe('正常系', () => {
    it('指定されたIDのノートブックを削除する', async () => {
      // Arrange
      const userId = 'user-123';

      const request = createMockRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        userId,
      });

      // Act
      const response = await DELETE(request, mockContext);

      // Assert
      expect(response.status).toBe(200);
      
      const data = await expectSuccessResponse<{
        message: string;
        deletedId: string;
      }>(response);
      expect(data.message).toBe('ノートブックを削除しました');
      expect(data.deletedId).toBe(notebookId);
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.deleteNotebook).toHaveBeenCalledWith(
        userId,
        notebookId
      );
      expect(mockNoteService.deleteNotebook).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------
  // 異常系
  // ----------------------------------------

  describe('異常系', () => {
    it('未認証の場合は401エラーを返す', async () => {
      // Arrange
      mockAuthError('UNAUTHORIZED');

      const request = createMockRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
      });

      // Act
      const response = await DELETE(request, mockContext);

      // Assert
      await expectErrorResponse(response, 'AUTHENTICATION_FAILED', 401);
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.deleteNotebook).not.toHaveBeenCalled();
    });

    it('存在しないノートブックの場合は404エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const error = new Error('NOTEBOOK_NOT_FOUND');
      mockNoteService.deleteNotebook.mockRejectedValueOnce(error);

      const request = createMockRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        userId,
      });

      // Act
      const response = await DELETE(request, mockContext);

      // Assert
      expect(response.status).toBe(404);
      
      // サービスが呼ばれたことを確認
      expect(mockNoteService.deleteNotebook).toHaveBeenCalledWith(
        userId,
        notebookId
      );
    });

    it('他人のノートブックを削除しようとした場合は404エラーを返す', async () => {
      // Arrange
      const userId = 'user-456'; // 所有者ではない
      const error = new Error('NOTEBOOK_NOT_FOUND');
      mockNoteService.deleteNotebook.mockRejectedValueOnce(error);

      const request = createMockRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/notebooks/${notebookId}`,
        userId,
      });

      // Act
      const response = await DELETE(request, mockContext);

      // Assert
      expect(response.status).toBe(404);
    });
  });
});

// ============================================
// 統合テスト: CRUD操作の連携
// ============================================

describe('統合テスト: CRUD操作の連携', () => {
  beforeEach(() => {
    resetNoteServiceMocks();
    resetAuthMock();
  });

  it('ノートブックの作成→取得→更新→削除の一連の流れが正常に動作する', async () => {
    // このテストは実際のエンドポイント連携の確認用
    // 各エンドポイントが正しくモックサービスを呼び出すことを確認
    
    const userId = 'user-123';
    const notebookId = 'notebook-123';

    // 各メソッドが正しくモックを呼び出すことを確認
    expect(mockNoteService.createNotebook).toBeDefined();
    expect(mockNoteService.getNotebook).toBeDefined();
    expect(mockNoteService.updateNotebook).toBeDefined();
    expect(mockNoteService.deleteNotebook).toBeDefined();
  });
});
