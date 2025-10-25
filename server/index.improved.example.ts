/**
 * @file index.improved.example.ts
 * @description Socket.ioサーバー - エラーハンドリング統一版
 * @author Schoolverse Team
 * @updated 2025-10-24
 * 
 * 【改善点】
 * ✅ withSocketErrorHandler でイベントハンドラーをラップ
 * ✅ validateSocketPayload でバリデーション
 * ✅ requireFields で必須フィールドチェック
 * ✅ エラーログの統一
 * ✅ クライアントへのエラー通知
 * 
 * 【使用方法】
 * このファイルを参考に server/index.ts を改善してください
 */

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import {
  withSocketErrorHandler,
  emitError,
  validateSocketPayload,
  requireFields,
  handleSocketAuthError,
} from '../src/lib/socket/errorHandler';
import { ERROR_CODES } from '../src/constants/errors';

const PORT = Number(process.env.RT_PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
});

// ============================================
// 型定義
// ============================================

type Player = {
  userId: string;
  displayName?: string;
  x: number;
  y: number;
  socketId: string;
};

type ChatRoomMembers = Map<string, Set<string>>;
type VoiceRoomMembers = Map<string, Set<string>>;

// ============================================
// バリデーションスキーマ
// ============================================

const presenceJoinSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().optional(),
});

const positionUpdateSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const chatJoinSchema = z.object({
  roomId: z.string().min(1),
  userId: z.string().min(1),
});

const chatMessageSchema = z.object({
  roomId: z.string().min(1),
  userId: z.string().min(1),
  message: z.object({
    id: z.string(),
    content: z.string().min(1).max(1000),
    timestamp: z.string(),
  }),
});

const voiceOfferSchema = z.object({
  roomId: z.string().min(1),
  targetUserId: z.string().min(1),
  offer: z.object({
    type: z.literal('offer'),
    sdp: z.string(),
  }),
});

// ============================================
// 状態管理
// ============================================

const players = new Map<string, Player>();
const chatRooms = new Map<string, ChatRoomMembers>();
const voiceRooms = new Map<string, VoiceRoomMembers>();

// ============================================
// ヘルパー関数
// ============================================

function toStateArray(excludeUserId?: string) {
  const arr: Array<Pick<Player, 'userId' | 'x' | 'y' | 'displayName'>> = [];
  for (const p of players.values()) {
    if (p.userId !== excludeUserId) {
      arr.push({
        userId: p.userId,
        x: p.x,
        y: p.y,
        displayName: p.displayName,
      });
    }
  }
  return arr;
}

function ensureVoiceRoom(roomId: string): VoiceRoomMembers {
  if (!voiceRooms.has(roomId)) {
    voiceRooms.set(roomId, new Map());
  }
  return voiceRooms.get(roomId)!;
}

function isVoiceMember(roomId: string, userId: string, socketId: string): boolean {
  const roomMembers = voiceRooms.get(roomId);
  if (!roomMembers) return false;
  const sockets = roomMembers.get(userId);
  return sockets?.has(socketId) ?? false;
}

// ============================================
// Socket.io接続ハンドリング
// ============================================

io.on('connection', (socket: Socket) => {
  let currentUserId: string | null = null;

  console.log(`[Socket] New connection: ${socket.id}`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // プレゼンス（存在確認）イベント
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  socket.on(
    'presence:join',
    withSocketErrorHandler(socket, async (payload: unknown) => {
      // バリデーション
      const validated = validateSocketPayload(payload, presenceJoinSchema, socket);
      if (!validated) return;

      const { userId, displayName } = validated;
      currentUserId = userId;

      // プレイヤー情報の登録
      const prev = players.get(userId);
      const x = prev?.x ?? 800;
      const y = prev?.y ?? 600;
      const player: Player = {
        userId,
        displayName,
        x,
        y,
        socketId: socket.id,
      };
      players.set(userId, player);

      // ユーザーデータをSocketに保存
      socket.data.userId = userId;

      // 既存プレイヤーの状態を送信
      socket.emit('presence:state', toStateArray(userId));

      // 他のプレイヤーに参加を通知
      socket.broadcast.emit('presence:joined', {
        userId,
        x,
        y,
        displayName,
      });

      console.log(`[Presence] User joined: ${userId}`);
    })
  );

  socket.on(
    'space:position:update',
    withSocketErrorHandler(socket, async (payload: unknown) => {
      if (!currentUserId) {
        emitError(socket, ERROR_CODES.AUTH.UNAUTHORIZED);
        return;
      }

      // バリデーション
      const validated = validateSocketPayload(payload, positionUpdateSchema, socket);
      if (!validated) return;

      const { x, y } = validated;
      const player = players.get(currentUserId);
      if (!player) {
        emitError(socket, ERROR_CODES.RESOURCE.NOT_FOUND, { resource: 'player' });
        return;
      }

      // 位置更新
      player.x = x;
      player.y = y;

      // 他のプレイヤーに通知
      socket.broadcast.emit('space:position:update', {
        userId: currentUserId,
        x,
        y,
      });
    })
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // チャットイベント
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  socket.on(
    'chat:join',
    withSocketErrorHandler(socket, async (payload: unknown) => {
      // バリデーション
      const validated = validateSocketPayload(payload, chatJoinSchema, socket);
      if (!validated) return;

      const { roomId, userId } = validated;

      // ユーザー認証チェック
      if (currentUserId !== null && currentUserId !== userId) {
        emitError(socket, ERROR_CODES.AUTH.FORBIDDEN, {
          reason: 'User ID mismatch',
        });
        return;
      }

      // ルーム参加
      socket.join(roomId);

      if (!chatRooms.has(roomId)) {
        chatRooms.set(roomId, new Map());
      }
      const roomMembers = chatRooms.get(roomId)!;
      if (!roomMembers.has(userId)) {
        roomMembers.set(userId, new Set());
      }
      roomMembers.get(userId)!.add(socket.id);

      socket.emit('chat:room:joined', { roomId });
      console.log(`[Chat] User ${userId} joined room ${roomId}`);
    })
  );

  socket.on(
    'chat:message:new',
    withSocketErrorHandler(socket, async (payload: unknown) => {
      // バリデーション
      const validated = validateSocketPayload(payload, chatMessageSchema, socket);
      if (!validated) return;

      const { roomId, userId, message } = validated;

      // ルームメンバーシップチェック
      const roomMembers = chatRooms.get(roomId);
      if (!roomMembers?.get(userId)?.has(socket.id)) {
        emitError(socket, ERROR_CODES.ROOM.NOT_MEMBER, {
          roomId,
          userId,
        });
        return;
      }

      // メッセージ送信
      socket.to(roomId).emit('chat:message:new', message);
      console.log(`[Chat] Message sent in room ${roomId} by ${userId}`);
    })
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 音声通話イベント
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  socket.on(
    'voice:offer',
    withSocketErrorHandler(socket, async (payload: unknown) => {
      if (!currentUserId) {
        emitError(socket, ERROR_CODES.AUTH.UNAUTHORIZED);
        return;
      }

      // バリデーション
      const validated = validateSocketPayload(payload, voiceOfferSchema, socket);
      if (!validated) return;

      const { roomId, targetUserId, offer } = validated;

      // ボイスルームメンバーシップチェック
      if (!isVoiceMember(roomId, currentUserId, socket.id)) {
        emitError(socket, ERROR_CODES.ROOM.NOT_MEMBER, {
          roomId,
          userId: currentUserId,
        });
        return;
      }

      // ターゲットユーザーへのオファー送信
      const targets = voiceRooms.get(roomId)?.get(targetUserId);
      if (!targets || targets.size === 0) {
        emitError(socket, ERROR_CODES.RTC.PEER_CONNECTION_FAILED, {
          reason: 'Target user not found in voice room',
          targetUserId,
        });
        return;
      }

      targets.forEach((targetSocketId) => {
        io.to(targetSocketId).emit('voice:offer', {
          roomId,
          fromUserId: currentUserId,
          offer,
        });
      });

      console.log(`[Voice] Offer sent from ${currentUserId} to ${targetUserId} in room ${roomId}`);
    })
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 切断処理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);

    if (!currentUserId) return;

    // プレイヤー削除
    const prev = players.get(currentUserId);
    if (prev && prev.socketId === socket.id) {
      players.delete(currentUserId);
      socket.broadcast.emit('presence:left', { userId: currentUserId });
    }

    // チャットルームからの削除
    for (const [roomId, roomMembers] of chatRooms) {
      for (const [userId, sockets] of roomMembers) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          roomMembers.delete(userId);
        }
      }
      if (roomMembers.size === 0) {
        chatRooms.delete(roomId);
      }
    }

    // ボイスルームからの削除
    for (const [roomId, roomMembers] of voiceRooms) {
      for (const [userId, sockets] of roomMembers) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          roomMembers.delete(userId);
          io.to(`voice:${roomId}`).emit('voice:userLeft', { roomId, userId });
        }
      }
      if (roomMembers.size === 0) {
        voiceRooms.delete(roomId);
      }
    }
  });

  // エラーハンドリング
  socket.on('error', (error) => {
    console.error(`[Socket] Error on ${socket.id}:`, error);
  });
});

// ============================================
// サーバー起動
// ============================================

httpServer.listen(PORT, () => {
  console.log(`✅ Realtime server listening on :${PORT} (CORS: ${CORS_ORIGIN})`);
  console.log(`🔧 Error handling enabled`);
  console.log(`📝 Validation enabled`);
});

export {};
