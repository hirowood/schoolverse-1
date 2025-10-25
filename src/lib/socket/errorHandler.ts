/**
 * @file socketErrorHandler.ts
 * @description Socket.io用エラーハンドリングユーティリティ
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【機能】
 * - Socket.ioイベントハンドラーのエラー処理
 * - エラーイベントの送信
 * - ログ出力の統一
 * - 再接続ロジックのサポート
 * 
 * 【使用例】
 * ```typescript
 * import { withSocketErrorHandler, emitError } from '@/lib/socket/errorHandler';
 * 
 * socket.on('chat:message:new', withSocketErrorHandler(socket, async (payload) => {
 *   // ビジネスロジック
 *   await processMessage(payload);
 * }));
 * ```
 */

import { Socket } from 'socket.io';
import {
  AppError,
  normalizeError,
  logError,
} from '@/lib/utils/errors';
import { ERROR_CODES } from '@/constants/errors';

// ============================================
// 型定義
// ============================================

/**
 * Socket.ioイベントハンドラーの型
 */
type SocketHandler<T = unknown> = (payload: T, socket: Socket) => Promise<void> | void;

/**
 * Socketエラーハンドリング設定
 */
interface SocketErrorHandlerOptions {
  /** エラーイベント名（デフォルト: 'error'） */
  errorEvent?: string;
  /** ログ出力の無効化 */
  disableLogging?: boolean;
  /** カスタムログコンテキスト */
  logContext?: Record<string, unknown>;
  /** エラー時にソケットを切断するか */
  disconnectOnError?: boolean;
}

// ============================================
// エラーハンドラーラッパー
// ============================================

/**
 * Socket.ioイベントハンドラーをエラーハンドリングでラップ
 * 
 * @param socket - Socketインスタンス
 * @param handler - ラップするイベントハンドラー
 * @param options - エラーハンドリング設定
 * @returns エラーハンドリング機能付きハンドラー
 * 
 * @example
 * ```typescript
 * socket.on('message', withSocketErrorHandler(socket, async (payload) => {
 *   await processMessage(payload);
 * }));
 * ```
 */
export function withSocketErrorHandler<T = unknown>(
  socket: Socket,
  handler: SocketHandler<T>,
  options?: SocketErrorHandlerOptions
): SocketHandler<T> {
  return async (payload: T) => {
    try {
      await handler(payload, socket);
    } catch (error) {
      handleSocketError(error, socket, options);
    }
  };
}

/**
 * Socket.ioエラーを処理
 */
function handleSocketError(
  error: unknown,
  socket: Socket,
  options?: SocketErrorHandlerOptions
): void {
  // エラー変換
  const appError = error instanceof AppError ? error : normalizeError(error);

  // ログ出力
  if (!options?.disableLogging) {
    const logContext = {
      socketId: socket.id,
      userId: (socket.data as { userId?: string }).userId,
      ...options?.logContext,
    };
    logError(appError, logContext);
  }

  // クライアントにエラーを送信
  const errorEvent = options?.errorEvent || 'error';
  socket.emit(errorEvent, {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
    },
  });

  // 必要に応じて切断
  if (options?.disconnectOnError) {
    socket.disconnect(true);
  }
}

// ============================================
// エラー送信ヘルパー
// ============================================

/**
 * クライアントにエラーを送信
 * 
 * @example
 * ```typescript
 * if (!isValid) {
 *   emitError(socket, ERROR_CODES.VALIDATION.INVALID_INPUT);
 *   return;
 * }
 * ```
 */
export function emitError(
  socket: Socket,
  errorCode: string,
  metadata?: Record<string, unknown>
): void {
  const appError = new AppError(errorCode, metadata);
  
  socket.emit('error', {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
    },
  });

  logError(appError, {
    socketId: socket.id,
    userId: (socket.data as { userId?: string }).userId,
  });
}

/**
 * 特定のルームにエラーを送信
 */
export function emitErrorToRoom(
  socket: Socket,
  roomId: string,
  errorCode: string,
  metadata?: Record<string, unknown>
): void {
  const appError = new AppError(errorCode, metadata);
  
  socket.to(roomId).emit('error', {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
    },
  });

  logError(appError, {
    socketId: socket.id,
    roomId,
    userId: (socket.data as { userId?: string }).userId,
  });
}

/**
 * 全クライアントにエラーを送信
 */
export function broadcastError(
  io: { emit: (event: string, data: unknown) => void },
  errorCode: string,
  metadata?: Record<string, unknown>
): void {
  const appError = new AppError(errorCode, metadata);
  
  io.emit('error', {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
    },
  });

  logError(appError, { type: 'broadcast' });
}

// ============================================
// バリデーションヘルパー
// ============================================

/**
 * Socketペイロードのバリデーション
 * 
 * @example
 * ```typescript
 * const validated = validateSocketPayload(payload, joinRoomSchema, socket);
 * if (!validated) return; // エラーは自動送信済み
 * ```
 */
export function validateSocketPayload<T>(
  payload: unknown,
  schema: {
    safeParse: (data: unknown) => { success: boolean; data?: T; error?: { issues: Array<{ path: Array<string | number>; message: string }> } }
  },
  socket: Socket
): T | null {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const errors = result.error!.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    socket.emit('error', {
      error: {
        code: ERROR_CODES.VALIDATION.FAILED,
        message: '入力値が無効です',
        validationErrors: errors,
        timestamp: new Date().toISOString(),
      },
    });

    return null;
  }

  return result.data!;
}

/**
 * 必須フィールドのチェック
 * 
 * @example
 * ```typescript
 * if (!requireFields(payload, ['userId', 'roomId'], socket)) return;
 * ```
 */
export function requireFields<T extends Record<string, unknown>>(
  payload: T,
  fields: Array<keyof T>,
  socket: Socket
): boolean {
  const missingFields = fields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    emitError(socket, ERROR_CODES.VALIDATION.REQUIRED_FIELD, {
      missingFields,
    });
    return false;
  }

  return true;
}

// ============================================
// 安全な実行ヘルパー
// ============================================

/**
 * 非同期処理の安全な実行
 * 
 * @example
 * ```typescript
 * const [error, result] = await safeSocketAsync(() => fetchData());
 * if (error) {
 *   emitError(socket, error.code);
 *   return;
 * }
 * ```
 */
export async function safeSocketAsync<T>(
  fn: () => Promise<T>
): Promise<[AppError | null, T | null]> {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    const appError = error instanceof AppError ? error : normalizeError(error);
    return [appError, null];
  }
}

// ============================================
// 接続エラーハンドラー
// ============================================

/**
 * Socket接続エラーを処理
 * 
 * @example
 * ```typescript
 * socket.on('connect_error', (err) => {
 *   handleSocketConnectionError(err, socket);
 * });
 * ```
 */
export function handleSocketConnectionError(
  error: Error,
  socket: Socket
): void {
  const appError = new AppError(
    ERROR_CODES.SOCKET.CONNECTION_ERROR,
    {
      originalError: error.message,
      socketId: socket.id,
    }
  );

  logError(appError, {
    socketId: socket.id,
    type: 'connection_error',
  });

  socket.emit('error', {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
    },
  });
}

/**
 * Socket認証エラーを処理
 */
export function handleSocketAuthError(
  socket: Socket,
  reason?: string
): void {
  const appError = new AppError(
    ERROR_CODES.SOCKET.AUTH_ERROR,
    { reason }
  );

  logError(appError, {
    socketId: socket.id,
    type: 'auth_error',
  });

  socket.emit('error', {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp.toISOString(),
    },
  });

  // 認証エラーの場合は切断
  socket.disconnect(true);
}

// ============================================
// エクスポート
// ============================================

export * from '@/lib/utils/errors';
