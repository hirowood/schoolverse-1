import '@testing-library/jest-dom/vitest';
import './mswServer';
import { vi } from 'vitest';

/**
 * @file vitest.setup.ts
 * @description Vitestグローバルセットアップ
 * @updated 2025-10-24 - canvasモジュールのモック追加
 */

// ============================================
// canvasモジュールのモック
// ============================================

// fabricパッケージが依存するcanvasモジュールをモック化
// テスト環境（jsdom）ではネイティブモジュールが動作しないため
vi.mock('canvas', () => {
  return {
    Canvas: class Canvas {
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
    },
    
    Image: class Image {
      src: string = '';
      width: number = 0;
      height: number = 0;
      onload: (() => void) | null = null;
      onerror: ((error: Error) => void) | null = null;
    },
    
    createCanvas: (width: number, height: number) => {
      return {
        width,
        height,
        getContext: () => ({
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
        }),
        toBuffer: () => Buffer.from('mock-canvas-buffer'),
        toDataURL: () => 'data:image/png;base64,mock-data',
      };
    },
    
    createImageData: (width: number, height: number) => ({
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    }),
    
    loadImage: (source: string) => Promise.resolve({
      src: source,
      width: 100,
      height: 100,
    }),
    
    registerFont: vi.fn(),
  };
});

// fabricパッケージもモック化（必要に応じて）
vi.mock('fabric', () => {
  return {
    fabric: {
      Canvas: vi.fn(),
      Object: vi.fn(),
      Circle: vi.fn(),
      Rect: vi.fn(),
      Text: vi.fn(),
    },
  };
});
