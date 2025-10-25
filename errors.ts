/**
 * @file errors.ts
 * @description カスタムエラークラス定義（Phase 1.5: Step 4完全実装）
 * @author Schoolverse Team
 * @created 2025-10-24
 * @updated 2025-10-25
 * 
 * 【設計原則】
 * - SOLID原則: 各エラークラスは単一責任
 * - DRY原則: 共通処理はベースクラスに集約
 * - 型安全性: TypeScriptで完全な型保護
 * - 拡張性: 新しいエラータイプの追加が容易
 * 
 * 【実装完了項目】
 * ✅ ベースエラークラス（AppError）
 * ✅ 認証・認可エラー（AuthenticationError, AuthorizationError）
 * ✅ バリデーションエラー（ValidationError）
 * ✅ リソースエラー（NotFoundError, ConflictError）
 * ✅ データベースエラー（DatabaseError）
 * ✅ Socket.ioエラー（SocketError）← 新規追加
 * ✅ WebRTCエラー（RTCError）← 新規追加
 * ✅ レート制限エラー（RateLimitError）
 * ✅ 内部エラー（InternalError, ServiceUnavailableError）← 新規追加
 * ✅ ヘルパー関数（normalizeError, isAppError, logError）
 * 
 * 【使用例】
 * ```typescript
 * import { NotFoundError, ValidationError } from '@/lib/utils/errors';
 * 
 * // リソースが見つからない場合
 * if (!user) {
 *   throw new NotFoundError('user', { userId: '123' });
 * }
 * 
 * // バリデーションエラー
 * if (!isValid) {
 *   throw new ValidationError([
 *     { field: 'email', message: 'Invalid email format' }
 *   ]);
 * }
 * 
 * // Socket通信エラー
 * socket.on('error', (err) => {
 *   throw new SocketError('Connection failed', {
 *     socketId: socket.id,
 *     originalError: err
 *   });
 * });
 * ```
 */

import { ERROR_CODES, ERROR_MESSAGES, ERROR_STATUS_CODES, type ErrorCode } from '@/constants/errors';

// ============================================
// 型定義
// ============================================

/**
 * エラーメタデータの型
 * エラーに関連する追加情報を格納
 */
export interface ErrorMetadata {
  [key: string]: unknown;
}

/**
 * バリデーションエラーの詳細型
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * エラーレスポンスの型（API返却用）
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    metadata?: ErrorMetadata;
    stack?: string;
  };
}

// ============================================
// ベースエラークラス
// ============================================

/**
 * アプリケーション共通のベースエラークラス
 * 
 * @description
 * すべてのカスタムエラーの基底クラス。
 * HTTPステータスコード、エラーコード、メタデータを統一管理。
 * 
 * @property {string} code - エラーコード（ERROR_CODES定数から選択）
 * @property {number} statusCode - HTTPステータスコード（自動決定）
 * @property {string} message - ユーザー向けエラーメッセージ
 * @property {ErrorMetadata} metadata - デバッグ用の追加情報
 * @property {Date} timestamp - エラー発生日時
 * @property {boolean} isOperational - 運用上想定内のエラーか
 * 
 * @example
 * ```typescript
 * throw new AppError(
 *   ERROR_CODES.AUTH.INVALID_TOKEN,
 *   { token: 'abc123', userId: '456' }
 * );
 * ```
 */
export class AppError extends Error {
  /** エラーコード */
  public readonly code: string;
  
  /** HTTPステータスコード */
  public readonly statusCode: number;
  
  /** ユーザー向けメッセージ */
  public readonly message: string;
  
  /** デバッグ用の追加情報 */
  public readonly metadata?: ErrorMetadata;
  
  /** エラー発生時刻 */
  public readonly timestamp: Date;
  
  /** エラーがクライアント側のものか（運用上想定内か） */
  public readonly isOperational: boolean;

  /**
   * AppErrorコンストラクタ
   * 
   * @param errorCode - ERROR_CODES定数からのエラーコード
   * @param metadata - 追加のコンテキスト情報
   * @param isOperational - 運用上想定内のエラーか（デフォルト: true）
   */
  constructor(
    errorCode: string,
    metadata?: ErrorMetadata,
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

    // スタックトレースを適切に保持（V8エンジン）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * JSON形式に変換（API レスポンス用）
   * 
   * @param includeStack - スタックトレースを含めるか（開発環境のみtrue推奨）
   * @returns API返却用のエラーレスポンス
   */
  toJSON(includeStack = false): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        ...(process.env.NODE_ENV === 'development' && this.metadata && { metadata: this.metadata }),
        ...(includeStack && { stack: this.stack }),
      },
    };
  }

  /**
   * ログ出力用の詳細情報
   * 
   * @returns ログシステムに送信する詳細情報
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
// 認証・認可エラー (401, 403)
// ============================================

/**
 * 認証エラークラス
 * 
 * @description
 * ログイン失敗、トークン無効など、認証に関するエラー。
 * HTTPステータスコード: 401 Unauthorized
 * 
 * @example
 * ```typescript
 * if (!isValidToken(token)) {
 *   throw new AuthenticationError({ token, reason: 'expired' });
 * }
 * ```
 */
export class AuthenticationError extends AppError {
  constructor(metadata?: ErrorMetadata) {
    super(ERROR_CODES.AUTH.UNAUTHORIZED, metadata);
    this.name = 'AuthenticationError';
  }
}

/**
 * 認可エラークラス
 * 
 * @description
 * 権限不足によるアクセス拒否。
 * HTTPステータスコード: 403 Forbidden
 * 
 * @example
 * ```typescript
 * if (!user.isAdmin) {
 *   throw new AuthorizationError({
 *     userId: user.id,
 *     requiredRole: 'admin',
 *     userRole: user.role
 *   });
 * }
 * ```
 */
export class AuthorizationError extends AppError {
  constructor(metadata?: ErrorMetadata) {
    super(ERROR_CODES.AUTH.FORBIDDEN, metadata);
    this.name = 'AuthorizationError';
  }
}

// ============================================
// バリデーションエラー (400)
// ============================================

/**
 * バリデーションエラークラス
 * 
 * @description
 * Zodなどのバリデーションライブラリと統合。
 * 複数のフィールドエラーを一度に返却可能。
 * HTTPステータスコード: 400 Bad Request
 * 
 * @example
 * ```typescript
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   throw fromZodError(result.error);
 * }
 * 
 * // または直接作成
 * throw new ValidationError([
 *   { field: 'email', message: 'Invalid email format' },
 *   { field: 'password', message: 'Password too short' }
 * ]);
 * ```
 */
export class ValidationError extends AppError {
  /** バリデーションエラーの詳細リスト */
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(
    errors: ValidationErrorDetail[],
    metadata?: ErrorMetadata
  ) {
    super(ERROR_CODES.VALIDATION.FAILED, metadata);
    this.name = 'ValidationError';
    this.validationErrors = errors;
  }

  /**
   * @override
   * バリデーションエラーの詳細を含むJSON形式
   */
  toJSON(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        validationErrors: this.validationErrors,
      },
    } as ErrorResponse;
  }
}

// ============================================
// リソースエラー (404, 409)
// ============================================

/**
 * リソース未検出エラークラス
 * 
 * @description
 * 指定されたリソースが見つからない。
 * HTTPステータスコード: 404 Not Found
 * 
 * @example
 * ```typescript
 * const user = await findUser(id);
 * if (!user) {
 *   throw new NotFoundError('user', { userId: id });
 * }
 * ```
 */
export class NotFoundError extends AppError {
  constructor(resourceType: string, metadata?: ErrorMetadata) {
    super(ERROR_CODES.RESOURCE.NOT_FOUND, { resourceType, ...metadata });
    this.name = 'NotFoundError';
    // メッセージをリソースタイプに応じてカスタマイズ
    this.message = `${resourceType} が見つかりません`;
  }
}

/**
 * リソース競合エラークラス
 * 
 * @description
 * リソースが既に存在する場合（重複登録など）。
 * HTTPステータスコード: 409 Conflict
 * 
 * @example
 * ```typescript
 * const existing = await findUserByEmail(email);
 * if (existing) {
 *   throw new ConflictError(
 *     ERROR_CODES.RESOURCE.ALREADY_EXISTS,
 *     { email, existingUserId: existing.id }
 *   );
 * }
 * ```
 */
export class ConflictError extends AppError {
  constructor(errorCode: string, metadata?: ErrorMetadata) {
    super(errorCode, metadata);
    this.name = 'ConflictError';
  }
}

// ============================================
// データベースエラー (500)
// ============================================

/**
 * データベースエラークラス
 * 
 * @description
 * データベース操作の失敗。システムエラーとして扱われる。
 * HTTPステータスコード: 500 Internal Server Error
 * 
 * @example
 * ```typescript
 * try {
 *   await prisma.user.create({ data });
 * } catch (error) {
 *   throw new DatabaseError('user_create', {
 *     operation: 'create',
 *     model: 'User',
 *     originalError: error
 *   });
 * }
 * ```
 */
export class DatabaseError extends AppError {
  constructor(operation: string, metadata?: ErrorMetadata) {
    super(
      ERROR_CODES.DATABASE.OPERATION_FAILED,
      { operation, ...metadata },
      false // システムエラー（想定外）
    );
    this.name = 'DatabaseError';
  }
}

// ============================================
// Socket.ioエラー (500) - 新規追加
// ============================================

/**
 * Socket.io通信エラークラス
 * 
 * @description
 * WebSocket接続やSocket.io通信の失敗。
 * リアルタイム通信の問題を表現。
 * HTTPステータスコード: 500 Internal Server Error
 * 
 * @example
 * ```typescript
 * socket.on('error', (err) => {
 *   throw new SocketError('Connection failed', {
 *     socketId: socket.id,
 *     event: 'user:join',
 *     originalError: err
 *   });
 * });
 * 
 * // または接続エラー
 * if (!socket.connected) {
 *   throw new SocketError('Socket disconnected', {
 *     socketId: socket.id,
 *     lastEvent: 'disconnect'
 *   });
 * }
 * ```
 */
export class SocketError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ERROR_CODES.SOCKET.CONNECTION_ERROR, metadata);
    this.name = 'SocketError';
    this.message = message || 'Socket通信エラーが発生しました';
  }
}

// ============================================
// WebRTCエラー (500) - 新規追加
// ============================================

/**
 * WebRTC通信エラークラス
 * 
 * @description
 * WebRTC接続や音声・映像通信の失敗。
 * メディアストリーム、PeerConnection、ICEエラーなどを含む。
 * HTTPステータスコード: 500 Internal Server Error
 * 
 * @example
 * ```typescript
 * peerConnection.oniceconnectionstatechange = () => {
 *   if (peerConnection.iceConnectionState === 'failed') {
 *     throw new RTCError('ICE connection failed', {
 *       peerId: peer.id,
 *       state: peerConnection.iceConnectionState,
 *       iceGatheringState: peerConnection.iceGatheringState
 *     });
 *   }
 * };
 * 
 * // メディアストリームエラー
 * try {
 *   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 * } catch (error) {
 *   throw new RTCError('Media access denied', {
 *     permission: 'audio',
 *     originalError: error
 *   });
 * }
 * ```
 */
export class RTCError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ERROR_CODES.RTC.CONNECTION_ERROR, metadata);
    this.name = 'RTCError';
    this.message = message || 'WebRTC通信エラーが発生しました';
  }
}

// ============================================
// レート制限エラー (429)
// ============================================

/**
 * レート制限超過エラークラス
 * 
 * @description
 * APIリクエストのレート制限超過。
 * Retry-Afterヘッダーの値を保持。
 * HTTPステータスコード: 429 Too Many Requests
 * 
 * @example
 * ```typescript
 * if (requestCount > LIMIT) {
 *   throw new RateLimitError(3600, {
 *     limit: LIMIT,
 *     window: '1 hour',
 *     currentCount: requestCount
 *   });
 * }
 * ```
 */
export class RateLimitError extends AppError {
  /** リトライ可能になるまでの秒数 */
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, metadata?: ErrorMetadata) {
    super(ERROR_CODES.RATE_LIMIT.EXCEEDED, metadata);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  /**
   * @override
   * Retry-After情報を含むJSON形式
   */
  toJSON(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        retryAfter: this.retryAfter,
      },
    } as ErrorResponse;
  }
}

// ============================================
// 内部エラー (500, 503) - 新規追加
// ============================================

/**
 * 内部サーバーエラークラス
 * 
 * @description
 * 予期しないエラーやシステムエラー。
 * システムエラーとして扱われる（isOperational = false）。
 * HTTPステータスコード: 500 Internal Server Error
 * 
 * @example
 * ```typescript
 * try {
 *   // 複雑な処理
 *   const result = await complexOperation();
 * } catch (error) {
 *   throw new InternalError('Unexpected error in operation', {
 *     operation: 'complexOperation',
 *     originalError: error
 *   });
 * }
 * ```
 */
export class InternalError extends AppError {
  constructor(message?: string, metadata?: ErrorMetadata) {
    super(
      ERROR_CODES.INTERNAL.UNEXPECTED_ERROR,
      metadata,
      false // システムエラー（想定外）
    );
    this.name = 'InternalError';
    if (message) {
      this.message = message;
    }
  }
}

/**
 * サービス利用不可エラークラス
 * 
 * @description
 * メンテナンス中やサービス一時停止。
 * 一時的な問題であることを示す。
 * HTTPステータスコード: 503 Service Unavailable
 * 
 * @example
 * ```typescript
 * if (isMaintenanceMode()) {
 *   throw new ServiceUnavailableError('Scheduled maintenance', {
 *     estimatedRecovery: '2025-10-25T12:00:00Z',
 *     reason: 'database_upgrade'
 *   });
 * }
 * ```
 */
export class ServiceUnavailableError extends AppError {
  constructor(message?: string, metadata?: ErrorMetadata) {
    super(
      ERROR_CODES.INTERNAL.SERVICE_UNAVAILABLE,
      metadata,
      true // 運用上想定内（計画的なメンテナンスなど）
    );
    this.name = 'ServiceUnavailableError';
    if (message) {
      this.message = message;
    }
  }
}

// ============================================
// エラーハンドリングユーティリティ
// ============================================

/**
 * エラーが操作可能（運用上想定内）なものか判定
 * 
 * @param error - 判定対象のエラー
 * @returns 運用上想定内のエラーの場合true
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   if (isOperationalError(error)) {
 *     // 想定内のエラー: ログ警告レベル
 *     console.warn(error);
 *   } else {
 *     // 想定外のエラー: アラート発砲
 *     alertOps(error);
 *   }
 * }
 * ```
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * 未知のエラーをAppErrorに変換
 * 
 * @description
 * try-catchで捕捉した不明なエラーを統一形式に変換。
 * エラーの型に応じて適切なAppErrorサブクラスに変換。
 * 
 * @param error - 元のエラーオブジェクト
 * @returns AppError インスタンス
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   throw normalizeError(error);
 * }
 * ```
 */
export function normalizeError(error: unknown): AppError {
  // 既にAppErrorの場合
  if (error instanceof AppError) {
    return error;
  }

  // Errorオブジェクトの場合
  if (error instanceof Error) {
    return new InternalError(error.message, {
      originalError: error.message,
      stack: error.stack,
    });
  }

  // その他の型の場合（文字列、オブジェクトなど）
  return new InternalError('予期しないエラーが発生しました', {
    originalError: String(error),
  });
}

/**
 * エラーがAppErrorかどうかを判定（型ガード）
 * 
 * @param error - 判定対象
 * @returns AppErrorの場合true
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   if (isAppError(error)) {
 *     console.log(error.code); // 型安全にアクセス可能
 *   }
 * }
 * ```
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Zodバリデーションエラーを変換
 * 
 * @param zodError - Zodのバリデーションエラー
 * @returns ValidationErrorインスタンス
 * 
 * @example
 * ```typescript
 * const schema = z.object({
 *   email: z.string().email(),
 *   age: z.number().min(0)
 * });
 * 
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   throw fromZodError(result.error);
 * }
 * ```
 */
export function fromZodError(
  zodError: { issues: Array<{ path: Array<string | number>; message: string }> }
): ValidationError {
  const errors = zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return new ValidationError(errors);
}

/**
 * Prismaエラーを変換
 * 
 * @param error - Prismaのエラーオブジェクト
 * @returns 適切なAppErrorサブクラス
 * 
 * @example
 * ```typescript
 * try {
 *   await prisma.user.create({ data });
 * } catch (error) {
 *   throw fromPrismaError(error);
 * }
 * ```
 */
export function fromPrismaError(
  error: { code?: string; meta?: Record<string, unknown> }
): AppError {
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
 * - 想定内エラー: warning レベル
 * - 想定外エラー: error レベル + アラート
 * 
 * @param error - ログ出力するエラー
 * @param context - 追加のコンテキスト情報
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const appError = normalizeError(error);
 *   logError(appError, {
 *     userId: currentUser.id,
 *     endpoint: '/api/users',
 *     method: 'POST'
 *   });
 *   throw appError;
 * }
 * ```
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
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

export type { ErrorCode, ErrorMetadata, ValidationErrorDetail, ErrorResponse };
