/**
 * @file errorHandler.ts
 * @description フロントエンド用エラーハンドリングユーティリティ
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【機能】
 * - API エラーの処理
 * - Socket.io エラーの処理
 * - ユーザーへの通知
 * - エラーログの記録
 * 
 * 【使用例】
 * ```typescript
 * import { handleApiError, showErrorToast } from '@/lib/client/errorHandler';
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleApiError(error);
 * }
 * ```
 */

import { ERROR_MESSAGES } from '@/constants/errors';

// ============================================
// 型定義
// ============================================

/**
 * APIエラーレスポンスの型
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp?: string;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Socket.ioエラーの型
 */
export interface SocketError {
  error: {
    code: string;
    message: string;
    timestamp: string;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * エラー通知の設定
 */
export interface ErrorNotificationOptions {
  /** 通知を表示するか */
  showToast?: boolean;
  /** カスタムメッセージ */
  customMessage?: string;
  /** エラーログを出力するか */
  logError?: boolean;
  /** カスタムコールバック */
  onError?: (error: ApiErrorResponse) => void;
}

// ============================================
// エラーハンドラー
// ============================================

/**
 * APIエラーを処理
 * 
 * @param error - fetchなどから投げられたエラー
 * @param options - エラー通知の設定
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await fetch('/api/users');
 *   if (!response.ok) throw await response.json();
 * } catch (error) {
 *   handleApiError(error, { showToast: true });
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  options?: ErrorNotificationOptions
): ApiErrorResponse | null {
  const defaultOptions: ErrorNotificationOptions = {
    showToast: true,
    logError: true,
    ...options,
  };

  // エラーレスポンスの抽出
  const apiError = extractApiError(error);

  if (!apiError) {
    // 未知のエラー
    const unknownError: ApiErrorResponse = {
      error: {
        code: 'UNKNOWN_ERROR',
        message: '予期しないエラーが発生しました',
        statusCode: 500,
      },
    };

    if (defaultOptions.logError) {
      console.error('[Client Error]', error);
    }

    if (defaultOptions.showToast) {
      showErrorToast(unknownError.error.message);
    }

    if (defaultOptions.onError) {
      defaultOptions.onError(unknownError);
    }

    return unknownError;
  }

  // ログ出力
  if (defaultOptions.logError) {
    console.error('[API Error]', {
      code: apiError.error.code,
      message: apiError.error.message,
      statusCode: apiError.error.statusCode,
      timestamp: apiError.error.timestamp,
    });
  }

  // トースト通知
  if (defaultOptions.showToast) {
    const message = defaultOptions.customMessage || apiError.error.message;
    showErrorToast(message, apiError.error.validationErrors);
  }

  // カスタムコールバック
  if (defaultOptions.onError) {
    defaultOptions.onError(apiError);
  }

  return apiError;
}

/**
 * Socket.ioエラーを処理
 * 
 * @example
 * ```typescript
 * socket.on('error', (errorData) => {
 *   handleSocketError(errorData);
 * });
 * ```
 */
export function handleSocketError(
  error: SocketError,
  options?: ErrorNotificationOptions
): void {
  const defaultOptions: ErrorNotificationOptions = {
    showToast: true,
    logError: true,
    ...options,
  };

  // ログ出力
  if (defaultOptions.logError) {
    console.error('[Socket Error]', {
      code: error.error.code,
      message: error.error.message,
      timestamp: error.error.timestamp,
    });
  }

  // トースト通知
  if (defaultOptions.showToast) {
    const message = defaultOptions.customMessage || error.error.message;
    showErrorToast(message, error.error.validationErrors);
  }
}

// ============================================
// エラー抽出ヘルパー
// ============================================

/**
 * 未知のエラーからAPIエラーレスポンスを抽出
 */
function extractApiError(error: unknown): ApiErrorResponse | null {
  // 既にApiErrorResponse形式
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiErrorResponse).error === 'object'
  ) {
    return error as ApiErrorResponse;
  }

  // Responseオブジェクト
  if (error instanceof Response) {
    return null; // 非同期で処理する必要があるため
  }

  // Errorオブジェクト
  if (error instanceof Error) {
    return {
      error: {
        code: 'CLIENT_ERROR',
        message: error.message,
        statusCode: 500,
      },
    };
  }

  return null;
}

// ============================================
// トースト通知
// ============================================

/**
 * エラートーストを表示
 * 
 * @description
 * 実際のプロジェクトでは、toast ライブラリ（react-hot-toast など）を使用
 * ここでは簡易実装
 */
export function showErrorToast(
  message: string,
  validationErrors?: Array<{ field: string; message: string }>
): void {
  // TODO: 実際のトーストライブラリに置き換え
  // 例: toast.error(message)

  console.error('🔴 エラー:', message);

  if (validationErrors && validationErrors.length > 0) {
    console.error('バリデーションエラー:', validationErrors);
  }

  // 簡易的なブラウザアラート（開発用）
  if (process.env.NODE_ENV === 'development') {
    alert(`エラー: ${message}`);
  }
}

/**
 * 成功トーストを表示
 */
export function showSuccessToast(message: string): void {
  console.log('✅ 成功:', message);

  // TODO: 実際のトーストライブラリに置き換え
  // 例: toast.success(message)
}

// ============================================
// エラーメッセージ取得
// ============================================

/**
 * エラーコードからメッセージを取得
 * 
 * @example
 * ```typescript
 * const message = getErrorMessage('AUTH_INVALID_CREDENTIALS');
 * // => 'メールアドレスまたはパスワードが正しくありません'
 * ```
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || '予期しないエラーが発生しました';
}

/**
 * HTTPステータスコードからユーザーフレンドリーなメッセージを取得
 */
export function getStatusMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'リクエストが無効です';
    case 401:
      return 'ログインが必要です';
    case 403:
      return 'この操作を実行する権限がありません';
    case 404:
      return 'リソースが見つかりません';
    case 409:
      return 'リソースが競合しています';
    case 429:
      return 'リクエストが多すぎます。しばらくお待ちください';
    case 500:
      return 'サーバーエラーが発生しました';
    case 503:
      return 'サービスが一時的に利用できません';
    default:
      return 'エラーが発生しました';
  }
}

// ============================================
// React Query用ヘルパー
// ============================================

/**
 * React Query用のエラーハンドラー
 * 
 * @example
 * ```typescript
 * const { data, error } = useQuery({
 *   queryKey: ['user'],
 *   queryFn: fetchUser,
 *   onError: queryErrorHandler,
 * });
 * ```
 */
export function queryErrorHandler(error: unknown): void {
  handleApiError(error, {
    showToast: true,
    logError: true,
  });
}

/**
 * React Query Mutation用のエラーハンドラー
 * 
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   mutationFn: updateUser,
 *   onError: mutationErrorHandler,
 * });
 * ```
 */
export function mutationErrorHandler(error: unknown): void {
  handleApiError(error, {
    showToast: true,
    logError: true,
  });
}

// ============================================
// エラーバウンダリー用
// ============================================

/**
 * React Error Boundary用のエラーログ
 * 
 * @example
 * ```typescript
 * class ErrorBoundary extends React.Component {
 *   componentDidCatch(error, errorInfo) {
 *     logErrorBoundary(error, errorInfo);
 *   }
 * }
 * ```
 */
export function logErrorBoundary(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  console.error('[Error Boundary]', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });

  // TODO: 本番環境では Sentry などに送信
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: errorInfo });
  // }
}

// ============================================
// ネットワークエラー検出
// ============================================

/**
 * ネットワークエラーかどうかを判定
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

/**
 * ネットワークエラーを処理
 */
export function handleNetworkError(): void {
  showErrorToast('ネットワーク接続を確認してください');
  console.error('[Network Error] Failed to connect to server');
}
