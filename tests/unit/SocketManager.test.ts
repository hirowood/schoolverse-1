/**
 * @file SocketManager.test.ts
 * @description SocketManagerのユニットテスト
 * @author Schoolverse Team
 * @created 2025-10-24
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SocketManager } from '@/lib/socket/SocketManager';
import { io } from 'socket.io-client';

// Socket.ioのモック
vi.mock('socket.io-client');

describe('SocketManager', () => {
  let socketManager: SocketManager;
  let mockSocket: any;

  beforeEach(() => {
    // モックSocketの作成
    mockSocket = {
      id: 'test-socket-id',
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      io: {
        on: vi.fn(),
      },
    };

    // io関数のモック
    (io as any).mockReturnValue(mockSocket);

    socketManager = new SocketManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('Socket.io接続を確立する', () => {
      const userId = 'user-123';
      
      socketManager.connect(userId);

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          reconnection: true,
          transports: ['websocket'],
        })
      );
      expect(socketManager.getCurrentUserId()).toBe(userId);
    });

    it('既に接続済みの場合は警告を表示', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      mockSocket.connected = true;
      
      socketManager.connect('user-123');
      socketManager.connect('user-456');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already connected')
      );
    });
  });

  describe('disconnect', () => {
    it('Socket.io接続を切断する', () => {
      socketManager.connect('user-123');
      socketManager.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(socketManager.isConnected()).toBe(false);
      expect(socketManager.getCurrentUserId()).toBeNull();
    });
  });

  describe('emit', () => {
    it('イベントを送信する', () => {
      mockSocket.connected = true;
      socketManager.connect('user-123');
      
      socketManager.emit('space:position:update', { x: 100, y: 200 });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'space:position:update',
        { x: 100, y: 200 }
      );
    });

    it('未接続の場合は警告を表示', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      mockSocket.connected = false;
      
      socketManager.emit('space:position:update', { x: 100, y: 200 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot emit'),
        expect.anything()
      );
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('on', () => {
    it('イベントリスナーを登録する', () => {
      socketManager.connect('user-123');
      const callback = vi.fn();
      
      socketManager.on('presence:joined', callback);

      expect(mockSocket.on).toHaveBeenCalledWith('presence:joined', callback);
    });
  });

  describe('off', () => {
    it('イベントリスナーを削除する', () => {
      socketManager.connect('user-123');
      const callback = vi.fn();
      
      socketManager.on('presence:joined', callback);
      socketManager.off('presence:joined', callback);

      expect(mockSocket.off).toHaveBeenCalledWith('presence:joined', callback);
    });

    it('コールバック未指定で全リスナーを削除する', () => {
      socketManager.connect('user-123');
      const callback = vi.fn();
      
      socketManager.on('presence:joined', callback);
      socketManager.off('presence:joined');

      expect(mockSocket.off).toHaveBeenCalledWith('presence:joined');
    });
  });

  describe('getConnectionInfo', () => {
    it('接続情報を取得する', () => {
      const info = socketManager.getConnectionInfo();

      expect(info).toHaveProperty('state');
      expect(info).toHaveProperty('socketId');
      expect(info).toHaveProperty('reconnectAttempts');
      expect(info).toHaveProperty('lastError');
    });
  });

  describe('isConnected', () => {
    it('接続状態を返す', () => {
      mockSocket.connected = false;
      expect(socketManager.isConnected()).toBe(false);

      mockSocket.connected = true;
      socketManager.connect('user-123');
      expect(socketManager.isConnected()).toBe(true);
    });
  });
});
