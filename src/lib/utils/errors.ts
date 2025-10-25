/**
 * @file errors.ts
 * @description アプリケーション統一エラーハンドリングクラス
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【設計思想】
 * - 型安全なエラーハンドリング
 * - HTTPステータスコードの自動決定
 * - ログ出力の標準化
 * - フロントエンドとの統一インターフェース
 * 
 * 【使用例】
 * ```typescript
 * import { AppError } from '@/lib/utils/errors';
 * import { ERROR_CODES } from '@/constants/errors';
 * 
 * throw new AppError(
 *   ERROR_CODES.AUTH.INVALID_CREDENTIALS,
 *   { email: 'user@example.com' }
 * );
 * ```
 */

import { ERROR_CODES, ERROR_MESSAGES, ERROR_STATUS_CODES, type ErrorCode } from '@/constants/errors';

// ============================================
// エラークラス定義
// ============================================

/**
 * アプリケーション統一エラークラス
 * 
 * @description
 * - エラーコードからHTTPステータスコードを自動決定
 * - ログ出力用のメタデータを保持
 * - フロントエンドへのレスポンス形式を統一
 */
export class AppError extends Error {
  /** エラーコード */
  public readonly code: string;
  
  /** HTTPステータスコード */
  public readonly statusCode: number;
  
  /** ユーザー向けメッセージ */
  public readonly message: string;
  
  /** デバッグ用の追加情報 */
  public readonly metadata?: Record<string, unknown>;
  
  /** エラー発生時刻 */
  public readonly timestamp: Date;
  
  /** エラーがクライアント側のものか */
  public readonly isOperational: boolean;

  constructor(
    errorCode: string,
    metadata?: Record<string, unknown>,
    isOperational = true
  ) {
    const message = ERROR_MESSAGES[errorCode] || 'エラーが発生しました';
    super(message);

    this.name = 'AppError';
    this.code = errorCode;
    this.message = message;
    this.statusCode = ERROR_STATUS_CODES[errorCode] || 500;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.isOperational = isOperational;

    // スタックトレースを適切に保持
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * JSON形式に変換（API レスポンス用）
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        ...(process.env.NODE_ENV === 'development' && this.metadata && { metadata: this.metadata }),
      },
    };
  }

  /**
   * ログ出力用の詳細情報
   */
  toLogFormat() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      stack: this.stack,
      isOperational: this.isOperational,
    };
  }
}

// ============================================
// 特殊エラークラス
// ============================================

/**
 * バリデーションエラー
 * 
 * @description
 * Zodなどのバリデーションライブラリと統合
 */
export class ValidationError extends AppError {
  public readonly validationErrors: Array<{
    field: string;
    message: string;
  }>;

  constructor(
    errors: Array<{ field: string; message: string }>,
    metadata?: Record<string, unknown>
  ) {
    super(ERROR_CODES.VALIDATION.FAILED, metadata);
    this.name = 'ValidationError';
    this.validationErrors = errors;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        validationErrors: this.validationErrors,
      },
    };
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  constructor(metadata?: Record<string, unknown>) {
    super(ERROR_CODES.AUTH.UNAUTHORIZED, metadata);
    this.name = 'AuthenticationError';
  }
}

/**
 * 認可エラー
 */
export class AuthorizationError extends AppError {
  constructor(metadata?: Record<string, unknown>) {
    super(ERROR_CODES.AUTH.FORBIDDEN, metadata);
    this.name = 'AuthorizationError';
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
  constructor(resourceType: string, metadata?: Record<string, unknown>) {
    super(ERROR_CODES.RESOURCE.NOT_FOUND, { resourceType, ...metadata });
    this.name = 'NotFoundError';
  }
}

/**
 * リソース競合エラー
 */
export class ConflictError extends AppError {
  constructor(errorCode: string, metadata?: Record<string, unknown>) {
    super(errorCode, metadata);
    this.name = 'ConflictError';
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number; // 秒数

  constructor(retryAfter?: number, metadata?: Record<string, unknown>) {
    super(ERROR_CODES.RATE_LIMIT.EXCEEDED, metadata);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        retryAfter: this.retryAfter,
      },
    };
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends AppError {
  constructor(operation: string, metadata?: Record<string, unknown>) {
    super(ERROR_CODES.DATABASE.OPERATION_FAILED, { operation, ...metadata }, false); // システムエラー
    this.name = 'DatabaseError';
  }
}

// ============================================
// エラーハンドリングユーティリティ
// ============================================

/**
 * エラーが操作可能（運用上想定内）なものか判定
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * 未知のエラーをAppErrorに変換
 */
export function normalizeError(error: unknown): AppError {
  // 既にAppErrorの場合
  if (error instanceof AppError) {
    return error;
  }

  // Errorオブジェクトの場合
  if (error instanceof Error) {
    return new AppError(
      ERROR_CODES.INTERNAL.UNEXPECTED_ERROR,
      {
        originalError: error.message,
        stack: error.stack,
      },
      false
    );
  }

  // その他の型の場合
  return new AppError(
    ERROR_CODES.INTERNAL.UNEXPECTED_ERROR,
    {
      originalError: String(error),
    },
    false
  );
}

/**
 * Zodバリデーションエラーを変換
 */
export function fromZodError(zodError: { issues: Array<{ path: Array<string | number>; message: string }> }): ValidationError {
  const errors = zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return new ValidationError(errors);
}

/**
 * Prismaエラーを変換
 */
export function fromPrismaError(error: { code?: string; meta?: Record<string, unknown> }): AppError {
  const prismaCode = error.code;
  
  switch (prismaCode) {
    case 'P2002': // Unique constraint violation
      return new ConflictError(
        ERROR_CODES.RESOURCE.ALREADY_EXISTS,
        { prismaCode, meta: error.meta }
      );
    
    case 'P2025': // Record not found
      return new NotFoundError('record', { prismaCode, meta: error.meta });
    
    case 'P2003': // Foreign key constraint
      return new DatabaseError('foreign_key_violation', { prismaCode, meta: error.meta });
    
    default:
      return new DatabaseError('unknown_error', { prismaCode, meta: error.meta });
  }
}

// ============================================
// エラーロガー
// ============================================

/**
 * エラーをログ出力
 * 
 * @description
 * - 本番環境: 最小限の情報のみ
 * - 開発環境: 詳細情報とスタックトレース
 */
export function logError(error: AppError, context?: Record<string, unknown>) {
  const logData = {
    ...error.toLogFormat(),
    context,
    environment: process.env.NODE_ENV,
  };

  if (error.isOperational) {
    // 想定内のエラー: warning レベル
    console.warn('[AppError:Operational]', JSON.stringify(logData, null, 2));
  } else {
    // 想定外のエラー: error レベル
    console.error('[AppError:Critical]', JSON.stringify(logData, null, 2));
  }

  // TODO: 本番環境では Sentry などに送信
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: logData });
  // }
}

// ============================================
// 型定義エクスポート
// ============================================

export type { ErrorCode };
