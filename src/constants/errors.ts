/**
 * @file errors.ts
 * @description アプリケーション全体で使用するエラーコード定数
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【命名規則】
 * - カテゴリ_詳細_状態 の形式
 * - 全て大文字のスネークケース
 * - HTTPステータスコードと対応
 * 
 * 【使用例】
 * ```typescript
 * throw new AppError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, 401);
 * ```
 */

// ============================================
// エラーコード体系
// ============================================

/**
 * アプリケーション全体のエラーコード
 * 
 * 【構造】
 * - AUTH: 認証・認可関連
 * - VALIDATION: 入力バリデーション
 * - RESOURCE: リソース操作
 * - DATABASE: データベース操作
 * - SOCKET: Socket.io通信
 * - RTC: WebRTC通信
 * - FILE: ファイル操作
 * - RATE_LIMIT: レート制限
 * - INTERNAL: 内部エラー
 */
export const ERROR_CODES = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 認証・認可エラー (401, 403)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AUTH: {
    /** ログイン情報が無効 */
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    /** トークンが無効 */
    INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
    /** トークンが期限切れ */
    TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    /** トークンがない */
    TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
    /** 認証されていない */
    UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    /** アクセス権限がない */
    FORBIDDEN: 'AUTH_FORBIDDEN',
    /** セッションが無効 */
    INVALID_SESSION: 'AUTH_INVALID_SESSION',
    /** ログインが必要 */
    LOGIN_REQUIRED: 'AUTH_LOGIN_REQUIRED',
    /** リフレッシュトークンが無効 */
    INVALID_REFRESH_TOKEN: 'AUTH_INVALID_REFRESH_TOKEN',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // バリデーションエラー (400)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VALIDATION: {
    /** バリデーション失敗 */
    FAILED: 'VALIDATION_FAILED',
    /** 入力値が無効 */
    INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
    /** 必須フィールドがない */
    REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
    /** 値が範囲外 */
    OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
    /** フォーマットが不正 */
    INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    /** 値が重複 */
    DUPLICATE_VALUE: 'VALIDATION_DUPLICATE_VALUE',
    /** パスワードが弱い */
    WEAK_PASSWORD: 'VALIDATION_WEAK_PASSWORD',
    /** メールアドレスが無効 */
    INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
    /** ファイルサイズ超過 */
    FILE_TOO_LARGE: 'VALIDATION_FILE_TOO_LARGE',
    /** ファイル形式が無効 */
    INVALID_FILE_TYPE: 'VALIDATION_INVALID_FILE_TYPE',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // リソース関連エラー (404, 409)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RESOURCE: {
    /** リソースが見つからない */
    NOT_FOUND: 'RESOURCE_NOT_FOUND',
    /** ユーザーが見つからない */
    USER_NOT_FOUND: 'RESOURCE_USER_NOT_FOUND',
    /** ルームが見つからない */
    ROOM_NOT_FOUND: 'RESOURCE_ROOM_NOT_FOUND',
    /** メッセージが見つからない */
    MESSAGE_NOT_FOUND: 'RESOURCE_MESSAGE_NOT_FOUND',
    /** ノートが見つからない */
    NOTEBOOK_NOT_FOUND: 'RESOURCE_NOTEBOOK_NOT_FOUND',
    /** リソースが既に存在 */
    ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
    /** メールアドレスが既に登録済み */
    EMAIL_EXISTS: 'RESOURCE_EMAIL_EXISTS',
    /** ユーザー名が既に使用済み */
    USERNAME_EXISTS: 'RESOURCE_USERNAME_EXISTS',
    /** リソースが競合 */
    CONFLICT: 'RESOURCE_CONFLICT',
    /** リソースが削除済み */
    DELETED: 'RESOURCE_DELETED',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ルーム・アクセス関連エラー (403, 409)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ROOM: {
    /** ルームへのアクセス権限がない */
    FORBIDDEN: 'ROOM_FORBIDDEN',
    /** ルームが満員 */
    FULL: 'ROOM_FULL',
    /** ルームがロックされている */
    LOCKED: 'ROOM_LOCKED',
    /** 既にルームに参加済み */
    ALREADY_JOINED: 'ROOM_ALREADY_JOINED',
    /** ルームに参加していない */
    NOT_MEMBER: 'ROOM_NOT_MEMBER',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // データベースエラー (500)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DATABASE: {
    /** データベース操作失敗 */
    OPERATION_FAILED: 'DATABASE_OPERATION_FAILED',
    /** 接続エラー */
    CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
    /** クエリエラー */
    QUERY_ERROR: 'DATABASE_QUERY_ERROR',
    /** トランザクションエラー */
    TRANSACTION_ERROR: 'DATABASE_TRANSACTION_ERROR',
    /** 制約違反 */
    CONSTRAINT_VIOLATION: 'DATABASE_CONSTRAINT_VIOLATION',
    /** タイムアウト */
    TIMEOUT: 'DATABASE_TIMEOUT',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Socket.io通信エラー (500)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SOCKET: {
    /** 接続エラー */
    CONNECTION_ERROR: 'SOCKET_CONNECTION_ERROR',
    /** 認証エラー */
    AUTH_ERROR: 'SOCKET_AUTH_ERROR',
    /** イベント送信失敗 */
    EMIT_FAILED: 'SOCKET_EMIT_FAILED',
    /** タイムアウト */
    TIMEOUT: 'SOCKET_TIMEOUT',
    /** 切断された */
    DISCONNECTED: 'SOCKET_DISCONNECTED',
    /** 再接続失敗 */
    RECONNECT_FAILED: 'SOCKET_RECONNECT_FAILED',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WebRTC通信エラー (500)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RTC: {
    /** 接続エラー */
    CONNECTION_ERROR: 'RTC_CONNECTION_ERROR',
    /** ICE接続失敗 */
    ICE_FAILED: 'RTC_ICE_FAILED',
    /** メディアストリーム取得失敗 */
    MEDIA_ERROR: 'RTC_MEDIA_ERROR',
    /** オファー作成失敗 */
    OFFER_FAILED: 'RTC_OFFER_FAILED',
    /** アンサー作成失敗 */
    ANSWER_FAILED: 'RTC_ANSWER_FAILED',
    /** ピア接続失敗 */
    PEER_CONNECTION_FAILED: 'RTC_PEER_CONNECTION_FAILED',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ファイル操作エラー (400, 500)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FILE: {
    /** アップロード失敗 */
    UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
    /** ダウンロード失敗 */
    DOWNLOAD_FAILED: 'FILE_DOWNLOAD_FAILED',
    /** 削除失敗 */
    DELETE_FAILED: 'FILE_DELETE_FAILED',
    /** ファイルが見つからない */
    NOT_FOUND: 'FILE_NOT_FOUND',
    /** ファイルが大きすぎる */
    TOO_LARGE: 'FILE_TOO_LARGE',
    /** ファイル形式が無効 */
    INVALID_TYPE: 'FILE_INVALID_TYPE',
    /** ストレージ容量不足 */
    STORAGE_FULL: 'FILE_STORAGE_FULL',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // レート制限エラー (429)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RATE_LIMIT: {
    /** レート制限超過 */
    EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    /** リクエスト回数超過 */
    TOO_MANY_REQUESTS: 'RATE_LIMIT_TOO_MANY_REQUESTS',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 内部エラー (500)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INTERNAL: {
    /** 内部サーバーエラー */
    SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    /** 予期しないエラー */
    UNEXPECTED_ERROR: 'INTERNAL_UNEXPECTED_ERROR',
    /** 実装されていない */
    NOT_IMPLEMENTED: 'INTERNAL_NOT_IMPLEMENTED',
    /** サービス利用不可 */
    SERVICE_UNAVAILABLE: 'INTERNAL_SERVICE_UNAVAILABLE',
    /** 設定エラー */
    CONFIG_ERROR: 'INTERNAL_CONFIG_ERROR',
  },
} as const;

// ============================================
// エラーメッセージマップ
// ============================================

/**
 * エラーコードに対応する日本語メッセージ
 * 
 * 【国際化対応】
 * 将来的に i18n ライブラリと統合可能
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // 認証・認可
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 'メールアドレスまたはパスワードが正しくありません',
  [ERROR_CODES.AUTH.INVALID_TOKEN]: 'トークンが無効です',
  [ERROR_CODES.AUTH.TOKEN_EXPIRED]: 'トークンの有効期限が切れました。再度ログインしてください',
  [ERROR_CODES.AUTH.TOKEN_MISSING]: 'トークンが見つかりません',
  [ERROR_CODES.AUTH.UNAUTHORIZED]: '認証が必要です',
  [ERROR_CODES.AUTH.FORBIDDEN]: 'アクセス権限がありません',
  [ERROR_CODES.AUTH.INVALID_SESSION]: 'セッションが無効です。再度ログインしてください',
  [ERROR_CODES.AUTH.LOGIN_REQUIRED]: 'ログインが必要です',
  [ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN]: 'リフレッシュトークンが無効です',

  // バリデーション
  [ERROR_CODES.VALIDATION.FAILED]: '入力内容に誤りがあります',
  [ERROR_CODES.VALIDATION.INVALID_INPUT]: '入力値が無効です',
  [ERROR_CODES.VALIDATION.REQUIRED_FIELD]: '必須項目が入力されていません',
  [ERROR_CODES.VALIDATION.OUT_OF_RANGE]: '値が範囲外です',
  [ERROR_CODES.VALIDATION.INVALID_FORMAT]: '形式が正しくありません',
  [ERROR_CODES.VALIDATION.DUPLICATE_VALUE]: 'この値は既に使用されています',
  [ERROR_CODES.VALIDATION.WEAK_PASSWORD]: 'パスワードが弱すぎます',
  [ERROR_CODES.VALIDATION.INVALID_EMAIL]: 'メールアドレスの形式が正しくありません',
  [ERROR_CODES.VALIDATION.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます',
  [ERROR_CODES.VALIDATION.INVALID_FILE_TYPE]: 'ファイル形式が無効です',

  // リソース
  [ERROR_CODES.RESOURCE.NOT_FOUND]: 'リソースが見つかりません',
  [ERROR_CODES.RESOURCE.USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [ERROR_CODES.RESOURCE.ROOM_NOT_FOUND]: 'ルームが見つかりません',
  [ERROR_CODES.RESOURCE.MESSAGE_NOT_FOUND]: 'メッセージが見つかりません',
  [ERROR_CODES.RESOURCE.NOTEBOOK_NOT_FOUND]: 'ノートが見つかりません',
  [ERROR_CODES.RESOURCE.ALREADY_EXISTS]: 'リソースは既に存在します',
  [ERROR_CODES.RESOURCE.EMAIL_EXISTS]: 'このメールアドレスは既に登録されています',
  [ERROR_CODES.RESOURCE.USERNAME_EXISTS]: 'このユーザー名は既に使用されています',
  [ERROR_CODES.RESOURCE.CONFLICT]: 'リソースが競合しています',
  [ERROR_CODES.RESOURCE.DELETED]: 'このリソースは削除されています',

  // ルーム
  [ERROR_CODES.ROOM.FORBIDDEN]: 'このルームへのアクセス権限がありません',
  [ERROR_CODES.ROOM.FULL]: 'ルームが満員です',
  [ERROR_CODES.ROOM.LOCKED]: 'ルームがロックされています',
  [ERROR_CODES.ROOM.ALREADY_JOINED]: '既にルームに参加しています',
  [ERROR_CODES.ROOM.NOT_MEMBER]: 'ルームのメンバーではありません',

  // データベース
  [ERROR_CODES.DATABASE.OPERATION_FAILED]: 'データベース操作に失敗しました',
  [ERROR_CODES.DATABASE.CONNECTION_ERROR]: 'データベースに接続できません',
  [ERROR_CODES.DATABASE.QUERY_ERROR]: 'クエリの実行に失敗しました',
  [ERROR_CODES.DATABASE.TRANSACTION_ERROR]: 'トランザクションに失敗しました',
  [ERROR_CODES.DATABASE.CONSTRAINT_VIOLATION]: 'データ制約に違反しています',
  [ERROR_CODES.DATABASE.TIMEOUT]: 'データベース操作がタイムアウトしました',

  // Socket.io
  [ERROR_CODES.SOCKET.CONNECTION_ERROR]: 'Socket接続エラーが発生しました',
  [ERROR_CODES.SOCKET.AUTH_ERROR]: 'Socket認証に失敗しました',
  [ERROR_CODES.SOCKET.EMIT_FAILED]: 'イベント送信に失敗しました',
  [ERROR_CODES.SOCKET.TIMEOUT]: 'Socket通信がタイムアウトしました',
  [ERROR_CODES.SOCKET.DISCONNECTED]: 'Socket接続が切断されました',
  [ERROR_CODES.SOCKET.RECONNECT_FAILED]: '再接続に失敗しました',

  // WebRTC
  [ERROR_CODES.RTC.CONNECTION_ERROR]: 'WebRTC接続エラーが発生しました',
  [ERROR_CODES.RTC.ICE_FAILED]: 'ICE接続に失敗しました',
  [ERROR_CODES.RTC.MEDIA_ERROR]: 'メディアストリームの取得に失敗しました',
  [ERROR_CODES.RTC.OFFER_FAILED]: 'オファーの作成に失敗しました',
  [ERROR_CODES.RTC.ANSWER_FAILED]: 'アンサーの作成に失敗しました',
  [ERROR_CODES.RTC.PEER_CONNECTION_FAILED]: 'ピア接続に失敗しました',

  // ファイル
  [ERROR_CODES.FILE.UPLOAD_FAILED]: 'ファイルのアップロードに失敗しました',
  [ERROR_CODES.FILE.DOWNLOAD_FAILED]: 'ファイルのダウンロードに失敗しました',
  [ERROR_CODES.FILE.DELETE_FAILED]: 'ファイルの削除に失敗しました',
  [ERROR_CODES.FILE.NOT_FOUND]: 'ファイルが見つかりません',
  [ERROR_CODES.FILE.TOO_LARGE]: 'ファイルが大きすぎます',
  [ERROR_CODES.FILE.INVALID_TYPE]: 'ファイル形式が無効です',
  [ERROR_CODES.FILE.STORAGE_FULL]: 'ストレージ容量が不足しています',

  // レート制限
  [ERROR_CODES.RATE_LIMIT.EXCEEDED]: 'レート制限を超過しました。しばらく待ってから再試行してください',
  [ERROR_CODES.RATE_LIMIT.TOO_MANY_REQUESTS]: 'リクエスト回数が多すぎます',

  // 内部エラー
  [ERROR_CODES.INTERNAL.SERVER_ERROR]: 'サーバーエラーが発生しました',
  [ERROR_CODES.INTERNAL.UNEXPECTED_ERROR]: '予期しないエラーが発生しました',
  [ERROR_CODES.INTERNAL.NOT_IMPLEMENTED]: 'この機能は実装されていません',
  [ERROR_CODES.INTERNAL.SERVICE_UNAVAILABLE]: 'サービスが利用できません',
  [ERROR_CODES.INTERNAL.CONFIG_ERROR]: '設定エラーが発生しました',
};

// ============================================
// HTTPステータスコードマップ
// ============================================

/**
 * エラーコードに対応するHTTPステータスコード
 */
export const ERROR_STATUS_CODES: Record<string, number> = {
  // 400 Bad Request
  [ERROR_CODES.VALIDATION.FAILED]: 400,
  [ERROR_CODES.VALIDATION.INVALID_INPUT]: 400,
  [ERROR_CODES.VALIDATION.REQUIRED_FIELD]: 400,
  [ERROR_CODES.VALIDATION.OUT_OF_RANGE]: 400,
  [ERROR_CODES.VALIDATION.INVALID_FORMAT]: 400,
  [ERROR_CODES.VALIDATION.DUPLICATE_VALUE]: 400,
  [ERROR_CODES.VALIDATION.WEAK_PASSWORD]: 400,
  [ERROR_CODES.VALIDATION.INVALID_EMAIL]: 400,
  [ERROR_CODES.VALIDATION.FILE_TOO_LARGE]: 400,
  [ERROR_CODES.VALIDATION.INVALID_FILE_TYPE]: 400,

  // 401 Unauthorized
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.AUTH.INVALID_TOKEN]: 401,
  [ERROR_CODES.AUTH.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.AUTH.TOKEN_MISSING]: 401,
  [ERROR_CODES.AUTH.UNAUTHORIZED]: 401,
  [ERROR_CODES.AUTH.INVALID_SESSION]: 401,
  [ERROR_CODES.AUTH.LOGIN_REQUIRED]: 401,
  [ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN]: 401,

  // 403 Forbidden
  [ERROR_CODES.AUTH.FORBIDDEN]: 403,
  [ERROR_CODES.ROOM.FORBIDDEN]: 403,

  // 404 Not Found
  [ERROR_CODES.RESOURCE.NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE.USER_NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE.ROOM_NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE.MESSAGE_NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE.NOTEBOOK_NOT_FOUND]: 404,
  [ERROR_CODES.FILE.NOT_FOUND]: 404,

  // 409 Conflict
  [ERROR_CODES.RESOURCE.ALREADY_EXISTS]: 409,
  [ERROR_CODES.RESOURCE.EMAIL_EXISTS]: 409,
  [ERROR_CODES.RESOURCE.USERNAME_EXISTS]: 409,
  [ERROR_CODES.RESOURCE.CONFLICT]: 409,
  [ERROR_CODES.ROOM.FULL]: 409,
  [ERROR_CODES.ROOM.LOCKED]: 409,
  [ERROR_CODES.ROOM.ALREADY_JOINED]: 409,

  // 429 Too Many Requests
  [ERROR_CODES.RATE_LIMIT.EXCEEDED]: 429,
  [ERROR_CODES.RATE_LIMIT.TOO_MANY_REQUESTS]: 429,

  // 500 Internal Server Error
  [ERROR_CODES.DATABASE.OPERATION_FAILED]: 500,
  [ERROR_CODES.DATABASE.CONNECTION_ERROR]: 500,
  [ERROR_CODES.DATABASE.QUERY_ERROR]: 500,
  [ERROR_CODES.DATABASE.TRANSACTION_ERROR]: 500,
  [ERROR_CODES.DATABASE.CONSTRAINT_VIOLATION]: 500,
  [ERROR_CODES.DATABASE.TIMEOUT]: 500,
  [ERROR_CODES.SOCKET.CONNECTION_ERROR]: 500,
  [ERROR_CODES.SOCKET.AUTH_ERROR]: 500,
  [ERROR_CODES.SOCKET.EMIT_FAILED]: 500,
  [ERROR_CODES.SOCKET.TIMEOUT]: 500,
  [ERROR_CODES.SOCKET.DISCONNECTED]: 500,
  [ERROR_CODES.SOCKET.RECONNECT_FAILED]: 500,
  [ERROR_CODES.RTC.CONNECTION_ERROR]: 500,
  [ERROR_CODES.RTC.ICE_FAILED]: 500,
  [ERROR_CODES.RTC.MEDIA_ERROR]: 500,
  [ERROR_CODES.RTC.OFFER_FAILED]: 500,
  [ERROR_CODES.RTC.ANSWER_FAILED]: 500,
  [ERROR_CODES.RTC.PEER_CONNECTION_FAILED]: 500,
  [ERROR_CODES.FILE.UPLOAD_FAILED]: 500,
  [ERROR_CODES.FILE.DOWNLOAD_FAILED]: 500,
  [ERROR_CODES.FILE.DELETE_FAILED]: 500,
  [ERROR_CODES.FILE.TOO_LARGE]: 500,
  [ERROR_CODES.FILE.INVALID_TYPE]: 500,
  [ERROR_CODES.FILE.STORAGE_FULL]: 500,
  [ERROR_CODES.INTERNAL.SERVER_ERROR]: 500,
  [ERROR_CODES.INTERNAL.UNEXPECTED_ERROR]: 500,
  [ERROR_CODES.INTERNAL.NOT_IMPLEMENTED]: 500,
  [ERROR_CODES.INTERNAL.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.INTERNAL.CONFIG_ERROR]: 500,
};

// ============================================
// 型エクスポート
// ============================================

/** エラーコードの型 */
export type ErrorCode = 
  | (typeof ERROR_CODES.AUTH)[keyof typeof ERROR_CODES.AUTH]
  | (typeof ERROR_CODES.VALIDATION)[keyof typeof ERROR_CODES.VALIDATION]
  | (typeof ERROR_CODES.RESOURCE)[keyof typeof ERROR_CODES.RESOURCE]
  | (typeof ERROR_CODES.ROOM)[keyof typeof ERROR_CODES.ROOM]
  | (typeof ERROR_CODES.DATABASE)[keyof typeof ERROR_CODES.DATABASE]
  | (typeof ERROR_CODES.SOCKET)[keyof typeof ERROR_CODES.SOCKET]
  | (typeof ERROR_CODES.RTC)[keyof typeof ERROR_CODES.RTC]
  | (typeof ERROR_CODES.FILE)[keyof typeof ERROR_CODES.FILE]
  | (typeof ERROR_CODES.RATE_LIMIT)[keyof typeof ERROR_CODES.RATE_LIMIT]
  | (typeof ERROR_CODES.INTERNAL)[keyof typeof ERROR_CODES.INTERNAL];
