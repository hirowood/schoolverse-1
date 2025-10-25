/**
 * @file api.helper.ts
 * @description APIテスト用ヘルパー関数
 * @created 2025-10-24
 * 
 * 【機能】
 * - モックNextRequestの作成
 * - 認証トークンのモック
 * - レスポンスの検証ヘルパー
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// ============================================
// モックリクエスト作成
// ============================================

/**
 * モックNextRequestを作成
 * 
 * @param options - リクエストオプション
 * @returns モックされたNextRequest
 * 
 * @example
 * ```typescript
 * const request = createMockRequest({
 *   method: 'POST',
 *   body: { title: 'Test' },
 *   userId: 'user-123',
 * });
 * ```
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: unknown;
  userId?: string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    userId,
    headers = {},
    searchParams = {},
  } = options;

  // URLにクエリパラメータを追加
  const urlWithParams = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value);
  });

  // ヘッダーの設定
  const requestHeaders = new Headers(headers);
  if (body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  // 認証トークンの設定
  if (userId) {
    // モック認証トークン（実際はJWT）
    requestHeaders.set('Cookie', `accessToken=mock-token-${userId}`);
  }

  // リクエストボディの設定
  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlWithParams, requestInit);
}

/**
 * モック認証情報を作成
 */
export function createMockAuth(userId: string) {
  return {
    userId,
    email: `user-${userId}@test.com`,
    name: `Test User ${userId}`,
  };
}

// ============================================
// レスポンス検証ヘルパー
// ============================================

/**
 * レスポンスのJSONを取得
 */
export async function getResponseJson<T = unknown>(
  response: Response
): Promise<T> {
  const text = await response.text();
  return JSON.parse(text) as T;
}

/**
 * 成功レスポンスの検証
 */
export async function expectSuccessResponse<T = unknown>(
  response: Response,
  expectedStatus = 200
): Promise<T> {
  expect(response.status).toBe(expectedStatus);
  
  const json = await getResponseJson<{ data: T }>(response);
  expect(json).toHaveProperty('data');
  
  return json.data;
}

/**
 * エラーレスポンスの検証
 */
export async function expectErrorResponse(
  response: Response,
  expectedCode: string,
  expectedStatus: number
): Promise<void> {
  expect(response.status).toBe(expectedStatus);
  
  const json = await getResponseJson<{
    error: {
      code: string;
      message: string;
      statusCode: number;
    };
  }>(response);
  
  expect(json).toHaveProperty('error');
  expect(json.error.code).toBe(expectedCode);
  expect(json.error.statusCode).toBe(expectedStatus);
}

/**
 * バリデーションエラーレスポンスの検証
 */
export async function expectValidationError(
  response: Response,
  expectedField?: string
): Promise<void> {
  expect(response.status).toBe(400);
  
  const json = await getResponseJson<{
    error: {
      code: string;
      message: string;
      statusCode: number;
      validationErrors?: Array<{
        field: string;
        message: string;
      }>;
    };
  }>(response);
  
  expect(json.error.code).toBe('VALIDATION_FAILED');
  
  if (expectedField) {
    expect(json.error.validationErrors).toBeDefined();
    const fieldError = json.error.validationErrors?.find(
      (err) => err.field === expectedField
    );
    expect(fieldError).toBeDefined();
  }
}

// ============================================
// テストデータ生成
// ============================================

/**
 * ランダムな文字列を生成
 */
export function randomString(length = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * ランダムなIDを生成
 */
export function randomId(): string {
  return `test-${randomString(16)}`;
}

/**
 * テスト用タイムスタンプを生成
 */
export function testTimestamp(): Date {
  return new Date('2025-10-24T00:00:00.000Z');
}
