/**
 * @file ErrorDisplay.tsx
 * @description エラーを安全に表示するコンポーネント
 * 
 * オブジェクトがレンダリングされるのを防ぎ、常に文字列として表示します。
 */

"use client";

interface ErrorDisplayProps {
  error: unknown;
  className?: string;
}

/**
 * エラーを安全に文字列化する関数
 */
function stringifyError(error: unknown): string {
  if (error == null) {
    return '';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object') {
    // エラーオブジェクトの場合
    const errorObj = error as Record<string, unknown>;
    
    // error.message が存在する場合
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // error.code が存在する場合
    if (errorObj.code && typeof errorObj.code === 'string') {
      return errorObj.code;
    }
    
    // error.error.message が存在する場合（API レスポンス）
    if (
      errorObj.error && 
      typeof errorObj.error === 'object' && 
      (errorObj.error as Record<string, unknown>).message
    ) {
      return String((errorObj.error as Record<string, unknown>).message);
    }
    
    // JSON文字列化を試みる
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return 'エラーが発生しました';
    }
  }
  
  // その他の型
  return String(error);
}

/**
 * エラー表示コンポーネント
 * 
 * @example
 * ```tsx
 * <ErrorDisplay error={error} />
 * <ErrorDisplay error={error} className="text-sm text-red-600" />
 * ```
 */
export default function ErrorDisplay({ error, className }: ErrorDisplayProps) {
  if (!error) {
    return null;
  }
  
  const errorMessage = stringifyError(error);
  
  if (!errorMessage) {
    return null;
  }
  
  return (
    <div className={className || "rounded bg-red-50 p-3 text-sm text-red-600"}>
      {errorMessage}
    </div>
  );
}

/**
 * インラインエラー表示用（シンプルバージョン）
 */
export function InlineError({ error }: { error: unknown }) {
  const errorMessage = stringifyError(error);
  
  if (!errorMessage) {
    return null;
  }
  
  return <span className="text-sm text-red-600">{errorMessage}</span>;
}
