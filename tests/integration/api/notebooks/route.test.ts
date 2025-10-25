/**
 * @file route.test.ts
 * @description /api/notebooks エンドポイントのテスト
 * @created 2025-10-24
 * 
 * 【テスト対象】
 * - GET /api/notebooks - ノート一覧取得
 * - POST /api/notebooks - ノート作成
 * 
 * 【テストパターン】
 * - 正常系: 期待通りの動作
 * - 異常系: エラーハンドリング
 * - エッジケース: 境界値テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/notebooks/route';
import {
  createMockRequest,
  expectSuccessResponse,
  expectErrorResponse,
  expectValidationError,
} from '@tests/helpers/api.helper';
import {
  createNotebookRequestBody,
  createMockNotebooks,
} from '@tests/factories/notebook.factory';
import {
  mockNoteService,
  resetNoteServiceMocks,
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
// GET /api/notebooks - ノート一覧取得
// ============================================

describe('GET /api/notebooks', () => {
  beforeEach(() => {
    resetNoteServiceMocks();
    resetAuthMock();
  });

  // ----------------------------------------
  // 正常系
  // ----------------------------------------

  describe('正常系', () => {
    it('認証済みユーザーのノート一覧を返す', async () => {
      // Arrange
      const userId = 'user-123';
      const mockNotebooks = createMockNotebooks(3, { ownerId: userId });
      mockNoteService.listMyNotebooks.mockResolvedValueOnce(mockNotebooks);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notebooks',
        userId,
      });

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      
      const data = await expectSuccessResponse<{ notebooks: unknown[] }>(response);
      expect(data.notebooks).toHaveLength(3);
      expect(data.notebooks[0]).toHaveProperty('id');
      expect(data.notebooks[0]).toHaveProperty('title');
      expect(data.notebooks[0]).toHaveProperty('tags');
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.listMyNotebooks).toHaveBeenCalledWith(userId);
      expect(mockNoteService.listMyNotebooks).toHaveBeenCalledTimes(1);
    });

    it('ノートが0件の場合は空配列を返す', async () => {
      // Arrange
      const userId = 'user-123';
      mockNoteService.listMyNotebooks.mockResolvedValueOnce([]);

      const request = createMockRequest({
        method: 'GET',
        userId,
      });

      // Act
      const response = await GET(request);

      // Assert
      const data = await expectSuccessResponse<{ notebooks: unknown[] }>(response);
      expect(data.notebooks).toHaveLength(0);
      expect(data.notebooks).toEqual([]);
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
        // userId を指定しない = 未認証
      });

      // Act
      const response = await GET(request);

      // Assert
      await expectErrorResponse(response, 'AUTHENTICATION_FAILED', 401);
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.listMyNotebooks).not.toHaveBeenCalled();
    });

    it('データベースエラーの場合は500エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      mockNoteService.listMyNotebooks.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = createMockRequest({
        method: 'GET',
        userId,
      });

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
    });
  });
});

// ============================================
// POST /api/notebooks - ノート作成
// ============================================

describe('POST /api/notebooks', () => {
  beforeEach(() => {
    resetNoteServiceMocks();
    resetAuthMock();
  });

  // ----------------------------------------
  // 正常系
  // ----------------------------------------

  describe('正常系', () => {
    it('有効なデータで新しいノートを作成する', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = createNotebookRequestBody({
        title: 'My New Notebook',
        description: 'Test description',
        tags: ['test', 'new'],
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      
      const data = await expectSuccessResponse<{ notebook: unknown }>(
        response,
        201
      );
      
      expect(data.notebook).toHaveProperty('id');
      expect(data.notebook).toHaveProperty('title');
      expect(data.notebook).toHaveProperty('tags');
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.createNotebook).toHaveBeenCalledWith({
        ownerId: userId,
        title: requestBody.title,
        description: requestBody.description,
        tags: requestBody.tags,
      });
    });

    it('descriptionがnullの場合でもノートを作成できる', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = createNotebookRequestBody({
        title: 'Minimal Notebook',
        description: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      
      // サービスが正しく呼ばれたことを確認
      expect(mockNoteService.createNotebook).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        })
      );
    });

    it('tagsが空配列の場合でもノートを作成できる', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = createNotebookRequestBody({
        title: 'No Tags Notebook',
        tags: [],
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });
  });

  // ----------------------------------------
  // 異常系: バリデーションエラー
  // ----------------------------------------

  describe('異常系: バリデーションエラー', () => {
    it('titleが空の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = createNotebookRequestBody({
        title: '',
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectValidationError(response, 'title');
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.createNotebook).not.toHaveBeenCalled();
    });

    it('titleが101文字以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const longTitle = 'a'.repeat(101);
      const requestBody = createNotebookRequestBody({
        title: longTitle,
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectValidationError(response, 'title');
    });

    it('descriptionが501文字以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const longDescription = 'a'.repeat(501);
      const requestBody = createNotebookRequestBody({
        title: 'Valid Title',
        description: longDescription,
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectValidationError(response, 'description');
    });

    it('tagsが21個以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
      const requestBody = createNotebookRequestBody({
        title: 'Valid Title',
        tags: tooManyTags,
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectValidationError(response, 'tags');
    });

    it('tagが21文字以上の場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      const longTag = 'a'.repeat(21);
      const requestBody = createNotebookRequestBody({
        title: 'Valid Title',
        tags: [longTag],
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectValidationError(response, 'tags');
    });

    it('リクエストボディが不正なJSONの場合は400エラーを返す', async () => {
      // Arrange
      const userId = 'user-123';
      
      // 不正なJSONを送信するために、モックリクエストを直接作成
      const request = new Request('http://localhost:3000/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=mock-token-${userId}`,
        },
        body: 'invalid json',
      });

      // Act
      const response = await POST(request as any);

      // Assert
      await expectValidationError(response, 'body');
    });
  });

  // ----------------------------------------
  // 異常系: 認証エラー
  // ----------------------------------------

  describe('異常系: 認証エラー', () => {
    it('未認証の場合は401エラーを返す', async () => {
      // Arrange
      mockAuthError('UNAUTHORIZED');

      const requestBody = createNotebookRequestBody();
      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        // userId を指定しない = 未認証
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectErrorResponse(response, 'AUTHENTICATION_FAILED', 401);
      
      // サービスが呼ばれていないことを確認
      expect(mockNoteService.createNotebook).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------
  // エッジケース
  // ----------------------------------------

  describe('エッジケース', () => {
    it('titleが1文字の場合でも作成できる', async () => {
      // Arrange
      const userId = 'user-123';
      const requestBody = createNotebookRequestBody({
        title: 'A',
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('titleが100文字の場合でも作成できる', async () => {
      // Arrange
      const userId = 'user-123';
      const maxLengthTitle = 'a'.repeat(100);
      const requestBody = createNotebookRequestBody({
        title: maxLengthTitle,
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('tagsが20個の場合でも作成できる', async () => {
      // Arrange
      const userId = 'user-123';
      const maxTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);
      const requestBody = createNotebookRequestBody({
        title: 'Max Tags',
        tags: maxTags,
      });

      const request = createMockRequest({
        method: 'POST',
        body: requestBody,
        userId,
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });
  });
});
