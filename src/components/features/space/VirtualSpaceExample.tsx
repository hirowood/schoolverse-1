/**
 * @file VirtualSpaceExample.tsx
 * @description 3D仮想空間コンポーネント（SocketManager統合版）
 * @author Schoolverse Team
 * @created 2025-10-24
 * 
 * 【変更点】
 * - useSocket フックで自動接続管理
 * - useSocketEvent で型安全なイベント受信
 * - socketManager で型安全なイベント送信
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';
import type { PositionUpdateBroadcastPayload, PresenceJoinedPayload, PresenceLeftPayload } from '@/types/socket.types';

interface Player {
  userId: string;
  x: number;
  y: number;
  displayName?: string;
}

export function VirtualSpaceExample() {
  const user = useAuthStore((state) => state.user);
  const { socket, isConnected, connectionInfo } = useSocket();
  
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [localPosition, setLocalPosition] = useState({ x: 800, y: 600 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Socket.io イベント受信
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 新規プレイヤー参加
  useSocketEvent('presence:joined', (data: PresenceJoinedPayload) => {
    console.log('[VirtualSpace] Player joined:', data);
    
    setPlayers((prev) => {
      const next = new Map(prev);
      next.set(data.userId, {
        userId: data.userId,
        x: data.x,
        y: data.y,
        displayName: data.displayName,
      });
      return next;
    });
  });

  // プレイヤー退出
  useSocketEvent('presence:left', (data: PresenceLeftPayload) => {
    console.log('[VirtualSpace] Player left:', data);
    
    setPlayers((prev) => {
      const next = new Map(prev);
      next.delete(data.userId);
      return next;
    });
  });

  // 位置更新
  useSocketEvent('space:position:update', (data: PositionUpdateBroadcastPayload) => {
    console.log('[VirtualSpace] Position update:', data);
    
    setPlayers((prev) => {
      const next = new Map(prev);
      const player = next.get(data.userId);
      if (player) {
        next.set(data.userId, { ...player, x: data.x, y: data.y });
      }
      return next;
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // キーボード操作
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 5;
      let newX = localPosition.x;
      let newY = localPosition.y;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY -= speed;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY += speed;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX -= speed;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX += speed;
          break;
        default:
          return;
      }

      // 境界チェック
      newX = Math.max(0, Math.min(1600, newX));
      newY = Math.max(0, Math.min(1200, newY));

      setLocalPosition({ x: newX, y: newY });

      // サーバーに位置を送信（型安全）
      socket.emit('space:position:update', { x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket, isConnected, localPosition]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Canvas描画
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 描画ループ
    const render = () => {
      // クリア
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 自分のアバター（青）
      if (user) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(localPosition.x, localPosition.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 名前表示
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(user.displayName || user.username, localPosition.x, localPosition.y - 25);
      }

      // 他のプレイヤー（赤）
      for (const player of players.values()) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 名前表示
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.displayName || player.userId.slice(0, 8), player.x, player.y - 25);
      }
    };

    const animationId = requestAnimationFrame(function loop() {
      render();
      requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animationId);
  }, [localPosition, players, user]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // レンダリング
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div className="relative">
      {/* 接続状態表示 */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg z-10">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-semibold">
            {isConnected ? '接続中' : '切断中'}
          </span>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div>状態: {connectionInfo.state}</div>
          <div>Socket ID: {connectionInfo.socketId?.slice(0, 8) || 'なし'}</div>
          <div>再接続試行: {connectionInfo.reconnectAttempts}</div>
          {connectionInfo.lastError && (
            <div className="text-red-600">エラー: {connectionInfo.lastError}</div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          プレイヤー数: {players.size}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1600}
        height={1200}
        className="border border-gray-300"
      />

      {/* 操作説明 */}
      <div className="mt-4 text-sm text-gray-600">
        <p>W/A/S/D または 矢印キーで移動</p>
      </div>
    </div>
  );
}
