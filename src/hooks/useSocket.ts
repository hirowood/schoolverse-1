"use client";
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket/socketClient';

export function useSocket() {
  const socket = getSocket();
  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      // keep connection for app-wide usage; no disconnect here
    };
  }, [socket]);
  return socket;
}

