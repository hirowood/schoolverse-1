/**
 * @file canvas.mock.ts
 * @description canvasモジュールのモック
 * @created 2025-10-24
 * 
 * 【目的】
 * Node.jsのネイティブモジュール`canvas`をテスト環境でモック化
 * fabricパッケージがcanvasに依存しているため、テストで問題が発生するのを防ぐ
 */

import { vi } from 'vitest';

// Canvasクラスのモック
export class Canvas {
  width: number;
  height: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  
  getContext() {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
    };
  }
  
  toBuffer() {
    return Buffer.from('mock-canvas-buffer');
  }
  
  toDataURL() {
    return 'data:image/png;base64,mock-data';
  }
}

// Imageクラスのモック
export class Image {
  src: string = '';
  width: number = 0;
  height: number = 0;
  onload: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
}

// createCanvasのモック
export function createCanvas(width: number, height: number) {
  return new Canvas(width, height);
}

// createImageDataのモック
export function createImageData(width: number, height: number) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  };
}

// loadImageのモック
export function loadImage(source: string) {
  return Promise.resolve(new Image());
}

// registerFontのモック
export function registerFont() {
  // モックなので何もしない
}

// デフォルトエクスポート
export default {
  Canvas,
  Image,
  createCanvas,
  createImageData,
  loadImage,
  registerFont,
};
