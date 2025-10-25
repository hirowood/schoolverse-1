/**
 * @file SocketManager.ts
 * @description Socket.io接続を一元管理するシングルトンクラス
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【機能】
 * - Socket.io接続の確立・切断
 * - 型安全なイベント送受信
 * - 自動再接続処理
 * - エラーハンドリング
 * - 接続状態管理
 * 
 * 【使用例】
 * ```typescript
 * import { socketManager } from '@/lib/socket/SocketManager';
 * 
 * // 接続
 * socketManager.connect('user-123');
 * 
 * // イベント送信
 * socketManager.emit('space:position:update', { x: 100, y: 200 });
 * 
 * // イベント受信
 * socketManager.on('presence:joined', (data) => {
 *   console.log('User joined:', data.userId);
 * });
 * 
 * // 切断
 * socketManager.disconnect();
 * ```
 */

import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketConnectionInfo,
  SocketConnectionState,
} from '@/types/socket.types';

// ============================================
// 設定
// ============================================

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
const RECONNECT_DELAY_MAX = 5000;
const TIMEOUT = 20000;

// ============================================
// SocketManager クラス
// ============================================

export class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private connectionState: SocketConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private currentUserId: string | null = null;
  private lastError: string | null = null;

  // イベントリスナーを保持（クリーンアップ用）
  private listeners = new Map<
    keyof ServerToClientEvents,
    Set<(...args: unknown[]) => void>
  >();

  /**
   * Socket.io接続を確立します
   * @param userId - 接続するユーザーID
   */
  public connect(userId: string): void {
    if (this.socket?.connected) {
      console.warn('[SocketManager] Already connected');
      return;
    }

    this.currentUserId = userId;
    this.connectionState = 'connecting';
    this.lastError = null;

    console.log('[SocketManager] Connecting...', { userId, url: SOCKET_URL });

    // Socket.io インスタンス作成
    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionDelayMax: RECONNECT_DELAY_MAX,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: TIMEOUT,
      transports: ['websocket'], // WebSocketのみ使用（pollingを無効化）
    });

    this.setupEventListeners();
  }

  /**
   * Socket.io接続を切断します
   */
  public disconnect(): void {
    if (!this.socket) {
      console.warn('[SocketManager] No socket to disconnect');
      return;
    }

    console.log('[SocketManager] Disconnecting...');
    
    this.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.connectionState = 'disconnected';
    this.currentUserId = null;
    this.reconnectAttempts = 0;
    this.lastError = null;
  }

  /**
   * サーバーにイベントを送信します
   * @param event - イベント名
   * @param args - イベント引数
   */
  public emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): void {
    if (!this.socket?.connected) {
      console.warn('[SocketManager] Cannot emit: Socket not connected', { event });
      return;
    }

    console.log('[SocketManager] Emit:', event, args);
    this.socket.emit(event, ...args);
  }

  /**
   * サーバーからのイベントを受信します
   * @param event - イベント名
   * @param callback - コールバック関数
   */
  public on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K],
  ): void {
    if (!this.socket) {
      console.warn('[SocketManager] Cannot listen: Socket not initialized', { event });
      return;
    }

    // リスナーを記録
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (...args: unknown[]) => void);

    console.log('[SocketManager] Registered listener:', event);
    this.socket.on(event, callback as ServerToClientEvents[K]);
  }

  /**
   * イベントリスナーを削除します
   * @param event - イベント名
   * @param callback - コールバック関数（省略時は全て削除）
   */
  public off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K],
  ): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as ServerToClientEvents[K]);
      this.listeners.get(event)?.delete(callback as (...args: unknown[]) => void);
      console.log('[SocketManager] Removed listener:', event);
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
      console.log('[SocketManager] Removed all listeners for:', event);
    }
  }

  /**
   * 接続状態を取得します
   */
  public getConnectionInfo(): SocketConnectionInfo {
    return {
      state: this.connectionState,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
      lastError: this.lastError,
    };
  }

  /**
   * 接続されているかチェックします
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * 現在のユーザーIDを取得します
   */
  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // ============================================
  // プライベートメソッド
  // ============================================

  /**
   * Socket.ioイベントリスナーをセットアップします
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // 接続成功
    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.lastError = null;
      
      console.log('[SocketManager] Connected!', {
        socketId: this.socket?.id,
        userId: this.currentUserId,
      });

      // プレゼンス参加イベントを自動送信
      if (this.currentUserId) {
        this.emit('presence:join', { userId: this.currentUserId });
      }
    });

    // 切断
    this.socket.on('disconnect', (reason) => {
      this.connectionState = 'disconnected';
      
      console.warn('[SocketManager] Disconnected:', reason);

      // サーバー側から切断された場合は手動で再接続
      if (reason === 'io server disconnect') {
        console.log('[SocketManager] Server disconnected, attempting manual reconnect...');
        setTimeout(() => {
          this.socket?.connect();
        }, RECONNECT_DELAY);
      }
    });

    // 接続エラー
    this.socket.on('connect_error', (error) => {
      this.connectionState = 'error';
      this.reconnectAttempts++;
      this.lastError = error.message;
      
      console.error('[SocketManager] Connection error:', {
        error: error.message,
        attempts: this.reconnectAttempts,
        maxAttempts: MAX_RECONNECT_ATTEMPTS,
      });

      // 最大試行回数に達したら諦める
      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('[SocketManager] Max reconnect attempts reached');
        this.disconnect();
      }
    });

    // 再接続試行
    this.socket.io.on('reconnect_attempt', (attempt) => {
      this.connectionState = 'reconnecting';
      this.reconnectAttempts = attempt;
      
      console.log('[SocketManager] Reconnecting...', {
        attempt,
        maxAttempts: MAX_RECONNECT_ATTEMPTS,
      });
    });

    // 再接続成功
    this.socket.io.on('reconnect', (attempt) => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      
      console.log('[SocketManager] Reconnected!', { attempt });
    });

    // 再接続失敗
    this.socket.io.on('reconnect_failed', () => {
      this.connectionState = 'error';
      this.lastError = 'Reconnection failed';
      
      console.error('[SocketManager] Reconnection failed');
    });

    // サーバーからのエラー
    this.socket.on('error', (payload) => {
      console.error('[SocketManager] Server error:', payload);
      this.lastError = payload.message;
    });
  }

  /**
   * 全てのイベントリスナーを削除します
   */
  private removeAllListeners(): void {
    if (!this.socket) return;

    console.log('[SocketManager] Removing all listeners...');
    
    for (const [event, callbacks] of this.listeners.entries()) {
      for (const callback of callbacks) {
        this.socket.off(event, callback);
      }
    }
    
    this.listeners.clear();
  }
}

// ============================================
// シングルトンインスタンス
// ============================================

/**
 * SocketManagerのシングルトンインスタンス
 * アプリケーション全体で1つのSocket接続を共有します
 */
export const socketManager = new SocketManager();
