/**
 * @file socketAuth.ts
 * @description Socket.io JWT認証ミドルウェア
 * @created 2025-10-25
 * 
 * 【機能】
 * - Socket.io接続時にJWTトークンを検証
 * - トークンからuserIdを抽出してsocket.dataに格納
 * - 検証失敗時は接続を拒否
 */

import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'dev_access_secret';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email: string;
    username?: string;
  };
}

/**
 * Socket.io認証ミドルウェア
 * 
 * @description
 * 接続時にJWTトークンを検証し、認証済みユーザーのみ接続を許可します。
 * 
 * @example
 * ```typescript
 * // server/index.ts
 * io.use(socketAuthMiddleware);
 * 
 * io.on('connection', (socket: AuthenticatedSocket) => {
 *   console.log('Authenticated user:', socket.data.userId);
 * });
 * ```
 */
export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    // 1. クエリパラメータまたはハンドシェイクからトークンを取得
    const token = 
      socket.handshake.auth?.token || 
      socket.handshake.query?.token as string;

    if (!token) {
      return next(new Error('AUTHENTICATION_REQUIRED'));
    }

    // 2. JWTトークンを検証
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      sub: string;
      email: string;
      username?: string;
    };

    if (!decoded.sub) {
      return next(new Error('INVALID_TOKEN'));
    }

    // 3. socket.dataに認証情報を格納
    socket.data.userId = decoded.sub;
    socket.data.email = decoded.email;
    socket.data.username = decoded.username;

    console.log('[Socket.io Auth] Authenticated:', {
      userId: decoded.sub,
      socketId: socket.id,
    });

    next();
  } catch (error) {
    console.error('[Socket.io Auth] Verification failed:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('INVALID_TOKEN'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('TOKEN_EXPIRED'));
    }
    
    return next(new Error('AUTHENTICATION_FAILED'));
  }
}

/**
 * トークンの有効期限チェック
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}
