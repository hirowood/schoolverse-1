"use client";
import { useEffect, useRef, useState } from 'react';
import useKeyboard from '@/hooks/useKeyboard';

const WIDTH = 800;
const HEIGHT = 450;

export default function VirtualSpace() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useKeyboard();
  const [pos, setPos] = useState({ x: WIDTH / 2, y: HEIGHT / 2 });

  useEffect(() => {
    let raf: number;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const speed = 2.5;
    const draw = () => {
      // position update
      setPos((p) => {
        let { x, y } = p;
        if (keys.up) y -= speed;
        if (keys.down) y += speed;
        if (keys.left) x -= speed;
        if (keys.right) x += speed;
        x = Math.max(16, Math.min(WIDTH - 16, x));
        y = Math.max(16, Math.min(HEIGHT - 16, y));
        return { x, y };
      });

      // render
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // background grid
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = '#e2e8f0';
      for (let i = 0; i < WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, HEIGHT);
        ctx.stroke();
      }
      for (let j = 0; j < HEIGHT; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(WIDTH, j);
        ctx.stroke();
      }

      // avatar placeholder
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [keys, pos.x, pos.y]);

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full h-auto" />;
}
