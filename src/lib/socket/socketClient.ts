"use client";
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

declare global {
  interface Window {
    __SCHOOLVERSE_SOCKET__?: Socket;
  }
}

/**
 * クライアント側でCookieからアクセストークンを取得
 */
function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('sv_access_token=')
  );
  
  if (!tokenCookie) return null;
  
  return tokenCookie.split('=')[1];
}

export function setSocketInstance(instance: Socket | null) {
  socket = instance;
}

export function resetSocketInstance() {
  socket = null;
}

/**
 * Socket.io インスタンスを取得（認証トークン付き）
 * 
 * @returns Socket.io インスタンス
 */
export function getSocket(): Socket {
  if (socket) return socket;
  if (typeof window !== 'undefined' && window.__SCHOOLVERSE_SOCKET__) {
    socket = window.__SCHOOLVERSE_SOCKET__;
    return socket;
  }
  
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  
  // 🔧 修正: 認証トークンを送信
  const token = getAccessTokenFromCookie();
  
  socket = io(url, { 
    autoConnect: true, 
    transports: ['websocket'],
    auth: {
      token: token || undefined, // トークンを認証情報として送信
    },
  });
  
  // デバッグ用ログ
  if (process.env.NODE_ENV === 'development') {
    socket.on('connect', () => {
      console.log('[Socket.io] Connected with auth token:', token ? 'Yes' : 'No');
    });
    
    socket.on('connect_error', (error) => {
      console.error('[Socket.io] Connection error:', error.message);
    });
  }
  
  return socket;
}
