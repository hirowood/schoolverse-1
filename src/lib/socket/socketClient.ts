"use client";
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

declare global {
  interface Window {
    __SCHOOLVERSE_SOCKET__?: Socket;
  }
}

export function setSocketInstance(instance: Socket | null) {
  socket = instance;
}

export function resetSocketInstance() {
  socket = null;
}

export function getSocket(): Socket {
  if (socket) return socket;
  if (typeof window !== 'undefined' && window.__SCHOOLVERSE_SOCKET__) {
    socket = window.__SCHOOLVERSE_SOCKET__;
    return socket;
  }
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  socket = io(url, { autoConnect: true, transports: ['websocket'] });
  return socket;
}
