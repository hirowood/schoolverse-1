/**
 * @file useSocket.ts
 * @description Socket.ioを使うためのカスタムフック
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【機能】
 * - SocketManager接続の自動管理
 * - 認証ユーザーIDでの自動接続
 * - コンポーネントアンマウント時の自動クリーンアップ
 * - 接続状態の監視
 * 
 * 【使用例】
 * ```typescript
 * function MyComponent() {
 *   const { socket, isConnected, connectionInfo } = useSocket();
 *   
 *   useEffect(() => {
 *     if (!socket || !isConnected) return;
 *     
 *     socket.on('presence:joined', (data) => {
 *       console.log('User joined:', data.userId);
 *     });
 *     
 *     return () => {
 *       socket.off('presence:joined');
 *     };
 *   }, [socket, isConnected]);
 *   
 *   return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
 * }
 * ```
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { socketManager } from '@/lib/socket/SocketManager';
import { useAuthStore } from '@/store/authStore';
import type { SocketConnectionInfo } from '@/types/socket.types';

/**
 * Socket.ioフックの返り値
 */
export interface UseSocketReturn {
  /** SocketManagerインスタンス */
  socket: typeof socketManager | null;
  /** 接続状態 */
  isConnected: boolean;
  /** 詳細な接続情報 */
  connectionInfo: SocketConnectionInfo;
  /** 手動で再接続 */
  reconnect: () => void;
  /** 手動で切断 */
  disconnect: () => void;
}

/**
 * Socket.ioを使用するためのカスタムフック
 * 
 * - 認証済みユーザーの場合、自動的に接続を確立します
 * - コンポーネントがアンマウントされると自動的に切断します
 * - 接続状態をリアルタイムで監視できます
 * 
 * @param options - オプション設定
 * @param options.autoConnect - 自動接続するか（デフォルト: true）
 * @returns Socket関連の状態と関数
 */
export function useSocket(options: { autoConnect?: boolean } = {}): UseSocketReturn {
  const { autoConnect = true } = options;
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<SocketConnectionInfo>(
    socketManager.getConnectionInfo()
  );

  // 接続状態の監視
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = socketManager.isConnected();
      const info = socketManager.getConnectionInfo();
      
      setIsConnected(connected);
      setConnectionInfo(info);
    }, 1000); // 1秒ごとに状態をチェック

    return () => clearInterval(interval);
  }, []);

  // 自動接続
  useEffect(() => {
    if (!autoConnect || !isAuthenticated || !user?.id) {
      return;
    }

    // 既に接続済みの場合はスキップ
    if (socketManager.isConnected()) {
      console.log('[useSocket] Already connected');
      return;
    }

    console.log('[useSocket] Auto-connecting...', { userId: user.id });
    socketManager.connect(user.id);

    // クリーンアップ: コンポーネントがアンマウントされたら切断
    return () => {
      console.log('[useSocket] Disconnecting on unmount...');
      socketManager.disconnect();
    };
  }, [autoConnect, isAuthenticated, user?.id]);

  // 手動再接続
  const reconnect = useCallback(() => {
    if (!user?.id) {
      console.warn('[useSocket] Cannot reconnect: No user ID');
      return;
    }
    
    console.log('[useSocket] Manual reconnect');
    socketManager.disconnect();
    setTimeout(() => {
      socketManager.connect(user.id);
    }, 500);
  }, [user?.id]);

  // 手動切断
  const disconnect = useCallback(() => {
    console.log('[useSocket] Manual disconnect');
    socketManager.disconnect();
  }, []);

  return {
    socket: socketManager,
    isConnected,
    connectionInfo,
    reconnect,
    disconnect,
  };
}

/**
 * Socket.ioイベントリスナーを登録するカスタムフック
 * 
 * コンポーネントのライフサイクルに合わせて自動的にリスナーを登録・解除します
 * 
 * @example
 * ```typescript
 * useSocketEvent('presence:joined', (data) => {
 *   console.log('User joined:', data.userId);
 * });
 * ```
 */
export function useSocketEvent<K extends keyof import('@/types/socket.types').ServerToClientEvents>(
  event: K,
  callback: import('@/types/socket.types').ServerToClientEvents[K],
  deps: React.DependencyList = []
): void {
  const { socket, isConnected } = useSocket({ autoConnect: false });

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    console.log('[useSocketEvent] Registering listener:', event);
    socket.on(event, callback);

    return () => {
      console.log('[useSocketEvent] Removing listener:', event);
      socket.off(event, callback);
    };
  }, [socket, isConnected, event, ...deps]);
}
