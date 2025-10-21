"use client";
import { useEffect, useRef } from 'react';

export function useCanvas(width: number, height: number) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height]);
  return ref;
}

