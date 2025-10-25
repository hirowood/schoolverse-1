/**
 * @file errorHandler.ts
 * @description Next.js API Route用エラーハンドリングミドルウェア
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【機能】
 * - エラーの統一処理
 * - ログ出力
 * - クライアントへのレスポンス生成
 * - 開発/本番環境での出力切り替え
 * 
 * 【使用例】
 * ```typescript
 * import { withErrorHandler } from '@/lib/api/errorHandler';
 * 
 * export const POST = withErrorHandler(async (request: NextRequest) => {
 *   // ビジネスロジック
 *   const data = await someService.getData();
 *   return NextResponse.json({ data });
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import {
  AppError,
  ValidationError,
  normalizeError,
  fromZodError,
  fromPrismaError,
  logError,
} from '@/lib/utils/errors';
import { ERROR_CODES } from '@/constants/errors';

// ============================================
// 型定義
// ============================================

/**
 * APIハンドラー関数の型（Next.js 15完全対応）
 * 
 * Next.js 15では、paramsは常にPromiseです。
 * 動的ルート: Promise<{ id: string }>
 * 静的ルート: Promise<Record<string, never>>
 * 
 * @template P - paramsの型（デフォルト: Record<string, never>）
 * 
 * @example
 * ```typescript
 * // 動的ルート用
 * const handler: ApiHandler<{ id: string }> = async (request, context) => {
 *   const { id } = await context.params; // 常にawaitが必要
 * };
 * 
 * // 静的ルート用（paramsは空）
 * const handler: ApiHandler = async (request, context) => {
 *   // context.params は Promise<Record<string, never>>
 *   // 通常は使用しない
 * };
 * ```
 */
type ApiHandler<P extends Record<string, string> = Record<string, never>> = (
  request: NextRequest,
  context: { params: Promise<P> }
) => Promise<NextResponse> | NextResponse;

/**
 * エラーハンドリング設定
 */
interface ErrorHandlerOptions {
  /** カスタムエラー変換関数 */
  transformError?: (error: unknown) => AppError;
  /** ログ出力の無効化 */
  disableLogging?: boolean;
  /** カスタムログコンテキスト */
  logContext?: Record<string, unknown>;
}

// ============================================
// メインエラーハンドラー
// ============================================

/**
 * APIルートハンドラーをエラーハンドリングでラップ
 * 
 * @param handler - ラップするAPIハンドラー関数
 * @param options - エラーハンドリング設定
 * @returns エラーハンドリング機能付きハンドラー
 * 
 * @example
 * ```typescript
 * export const POST = withErrorHandler(async (request) => {
 *   const data = await getUserData();
 *   return NextResponse.json({ data });
 * });
 * ```
 */
export function withErrorHandler<P extends Record<string, string> = Record<string, never>>(
  handler: ApiHandler<P>,
  options?: ErrorHandlerOptions
): ApiHandler<P> {
  return async (request: NextRequest, context: { params: Promise<P> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error, request, options);
    }
  };
}

/**
 * エラーを処理してNextResponseを返す
 */
function handleError(
  error: unknown,
  request: NextRequest,
  options?: ErrorHandlerOptions
): NextResponse {
  // エラー変換
  let appError: AppError;

  if (options?.transformError) {
    // カスタム変換関数が指定されている場合
    appError = options.transformError(error);
  } else {
    // デフォルト変換
    appError = convertToAppError(error);
  }

  // ログ出力
  // 🔧 修正: 401エラー（未認証）は正常な動作として扱い、ログを抑制
  const shouldLog = !options?.disableLogging && appError.statusCode !== 401;
  
  if (shouldLog) {
    const logContext = {
      url: request.url,
      method: request.method,
      ...options?.logContext,
    };
    logError(appError, logContext);
  }

  // レスポンス生成
  return createErrorResponse(appError);
}

/**
 * 未知のエラーをAppErrorに変換
 */
function convertToAppError(error: unknown): AppError {
  // 既にAppErrorの場合
  if (error instanceof AppError) {
    return error;
  }

  // Zodバリデーションエラー
  if (error instanceof ZodError) {
    return fromZodError(error);
  }

  // Prismaエラー
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return fromPrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError([
      {
        field: 'database',
        message: 'データベースバリデーションエラー',
      },
    ]);
  }

  // 通常のErrorオブジェクト
  if (error instanceof Error) {
    // エラーメッセージが定義済みエラーコードの場合
    if (error.message in ERROR_CODES.AUTH) {
      return new AppError(error.message);
    }
    
    // その他のError
    return normalizeError(error);
  }

  // その他の型
  return normalizeError(error);
}

/**
 * エラーレスポンスを生成
 */
function createErrorResponse(error: AppError): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 開発環境では詳細情報を含める
  const responseBody = isDevelopment
    ? error.toJSON()
    : {
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
        },
      };

  return NextResponse.json(responseBody, {
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
      // CORSヘッダー（必要に応じて）
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// ============================================
// 特殊ケース用ヘルパー
// ============================================

/**
 * try-catchブロックでの簡易エラーハンドリング
 * 
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   return handleApiError(error, request);
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  options?: ErrorHandlerOptions
): NextResponse {
  return handleError(error, request, options);
}

/**
 * 非同期処理の安全な実行
 * 
 * @example
 * ```typescript
 * const [error, result] = await safeAsync(() => fetchData());
 * if (error) return handleApiError(error, request);
 * return NextResponse.json({ data: result });
 * ```
 */
export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<[AppError | null, T | null]> {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    return [convertToAppError(error), null];
  }
}

/**
 * 同期処理の安全な実行
 */
export function safe<T>(fn: () => T): [AppError | null, T | null] {
  try {
    const result = fn();
    return [null, result];
  } catch (error) {
    return [convertToAppError(error), null];
  }
}

// ============================================
// バリデーションヘルパー
// ============================================

/**
 * リクエストボディのバリデーション
 * 
 * @example
 * ```typescript
 * const body = await validateRequestBody(request, loginSchema);
 * // バリデーションエラーは自動でスロー
 * ```
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } }
): Promise<T> {
  const body = await request.json().catch(() => {
    throw new ValidationError([
      {
        field: 'body',
        message: 'リクエストボディのJSON形式が不正です',
      },
    ]);
  });

  const result = schema.safeParse(body);

  if (!result.success) {
    throw fromZodError(result.error!);
  }

  return result.data!;
}

/**
 * クエリパラメータのバリデーション
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } }
): T {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(params);

  if (!result.success) {
    throw fromZodError(result.error!);
  }

  return result.data!;
}

// ============================================
// レスポンスヘルパー
// ============================================

/**
 * 成功レスポンスの生成
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: Record<string, string>;
  }
): NextResponse {
  return NextResponse.json(
    { data },
    {
      status: options?.status || 200,
      headers: options?.headers,
    }
  );
}

/**
 * ページネーション付きレスポンスの生成
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  options?: {
    headers?: Record<string, string>;
  }
): NextResponse {
  return NextResponse.json(
    {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    },
    {
      status: 200,
      headers: options?.headers,
    }
  );
}

// ============================================
// エクスポート
// ============================================

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  normalizeError,
  fromZodError,
  fromPrismaError,
  logError,
} from '@/lib/utils/errors';
