"use client";
import { useEffect, useRef, useState } from 'react';
import useKeyboard from '@/hooks/useKeyboard';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket/socketClient';

// Viewport (canvas) size
const VIEW_W = 800;
const VIEW_H = 600;

// World (map) size
const MAP_W = 1600;
const MAP_H = 1200;
const TILE = 32;
const AVATAR_R = 16; // 32px diameter

// Movement speed: 200 px/sec
const SPEED = 200;

export default function VirtualSpace() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useKeyboard();
  const { user } = useAuthStore();
  const [pos, setPos] = useState({ x: MAP_W / 2, y: MAP_H / 2 }); // spawn center
  const peersRef = useRef<Map<string, { x: number; y: number; displayName?: string }>>(new Map());
  const lastSentRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000; // seconds
      last = now;

      // Update position using dt and clamp to map with wall (border) collision
      setPos((p) => {
        let { x, y } = p;
        const vel = SPEED * dt;
        if (keys.up) y -= vel;
        if (keys.down) y += vel;
        if (keys.left) x -= vel;
        if (keys.right) x += vel;
        const minX = AVATAR_R + TILE; // keep inside inner border
        const minY = AVATAR_R + TILE;
        const maxX = MAP_W - AVATAR_R - TILE;
        const maxY = MAP_H - AVATAR_R - TILE;
        x = Math.max(minX, Math.min(maxX, x));
        y = Math.max(minY, Math.min(maxY, y));
        return { x, y };
      });

      // Compute camera (top-left world coord shown)
      const camX = Math.max(0, Math.min(MAP_W - VIEW_W, pos.x - VIEW_W / 2));
      const camY = Math.max(0, Math.min(MAP_H - VIEW_H, pos.y - VIEW_H / 2));

      // Throttle position emits (~20Hz)
      if (user?.id) {
        if (now - lastSentRef.current > 50) {
          lastSentRef.current = now;
          getSocket().emit('space:position:update', { x: pos.x, y: pos.y });
        }
      }

      // Render scene
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);

      // Floor tiles
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const startTileX = Math.floor(camX / TILE) * TILE;
      const startTileY = Math.floor(camY / TILE) * TILE;
      for (let x = startTileX; x < camX + VIEW_W; x += TILE) {
        const sx = Math.floor(x - camX) + 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, VIEW_H);
        ctx.stroke();
      }
      for (let y = startTileY; y < camY + VIEW_H; y += TILE) {
        const sy = Math.floor(y - camY) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(VIEW_W, sy);
        ctx.stroke();
      }

      // Walls (border rectangles of TILE thickness)
      ctx.fillStyle = '#cbd5e1';
      // top
      drawWorldRect(ctx, camX, camY, 0, 0, MAP_W, TILE);
      // bottom
      drawWorldRect(ctx, camX, camY, 0, MAP_H - TILE, MAP_W, TILE);
      // left
      drawWorldRect(ctx, camX, camY, 0, 0, TILE, MAP_H);
      // right
      drawWorldRect(ctx, camX, camY, MAP_W - TILE, 0, TILE, MAP_H);

      // Self avatar
      const screenX = pos.x - camX;
      const screenY = pos.y - camY;
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(screenX, screenY, AVATAR_R, 0, Math.PI * 2);
      ctx.fill();

      // Name label
      if (user?.displayName) {
        ctx.fillStyle = '#111827';
        ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(user.displayName, screenX, screenY - AVATAR_R - 8);
      }

      // Peers
      peersRef.current.forEach((p) => {
        // draw only if in view
        const px = p.x - camX;
        const py = p.y - camY;
        if (px < -AVATAR_R || py < -AVATAR_R || px > VIEW_W + AVATAR_R || py > VIEW_H + AVATAR_R) return;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(px, py, AVATAR_R, 0, Math.PI * 2);
        ctx.fill();
        if (p.displayName) {
          ctx.fillStyle = '#065f46';
          ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.displayName, px, py - AVATAR_R - 8);
        }
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame((t) => {
      // Reset last to first frame time
      last = t;
      loop(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [keys, pos.x, pos.y, user?.displayName]);

  // Socket presence wiring
  useEffect(() => {
    const socket = getSocket();
    if (user?.id) {
      socket.emit('presence:join', { userId: user.id, displayName: user.displayName });
    }

    const onState = (players: Array<{ userId: string; x: number; y: number; displayName?: string }>) => {
      const m = new Map<string, { x: number; y: number; displayName?: string }>();
      players.forEach((p) => {
        if (p.userId !== user?.id) m.set(p.userId, { x: p.x, y: p.y, displayName: p.displayName });
      });
      peersRef.current = m;
    };
    const onJoined = (p: { userId: string; x: number; y: number; displayName?: string }) => {
      if (p.userId === user?.id) return;
      peersRef.current.set(p.userId, { x: p.x, y: p.y, displayName: p.displayName });
    };
    const onLeft = (p: { userId: string }) => {
      peersRef.current.delete(p.userId);
    };
    const onPos = (p: { userId: string; x: number; y: number }) => {
      const cur = peersRef.current.get(p.userId);
      if (!cur) return;
      cur.x = p.x; cur.y = p.y;
    };

    socket.on('presence:state', onState);
    socket.on('presence:joined', onJoined);
    socket.on('presence:left', onLeft);
    socket.on('space:position:update', onPos);
    return () => {
      socket.off('presence:state', onState);
      socket.off('presence:joined', onJoined);
      socket.off('presence:left', onLeft);
      socket.off('space:position:update', onPos);
    };
  }, [user?.id, user?.displayName]);

  return <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="w-full h-auto" />;
}

function drawWorldRect(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const sx = x - camX;
  const sy = y - camY;
  // cull if outside view
  if (sx + w < 0 || sy + h < 0 || sx > VIEW_W || sy > VIEW_H) return;
  ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(w), Math.ceil(h));
}
