// Simple Socket.io realtime server for presence + position updates (TypeScript)
// Usage: tsx server/index.ts
// Env: RT_PORT (default 3001), CORS_ORIGIN (default *)

import { createServer } from 'http';
import { Server } from 'socket.io';

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

type Player = {
  userId: string;
  displayName?: string;
  x: number;
  y: number;
  socketId: string;
};

// In-memory presence state
const players = new Map<string, Player>();
type ChatRoomMembers = Map<string, Set<string>>; // userId -> socketIds
const chatRooms = new Map<string, ChatRoomMembers>(); // roomId -> members map
type VoiceRoomMembers = Map<string, Set<string>>;
const voiceRooms = new Map<string, VoiceRoomMembers>(); // roomId -> userId -> socketIds

function toStateArray(excludeUserId?: string) {
  const arr: Array<Pick<Player, 'userId' | 'x' | 'y' | 'displayName'>> = [];
  for (const p of players.values()) {
    if (p.userId !== excludeUserId) arr.push({ userId: p.userId, x: p.x, y: p.y, displayName: p.displayName });
  }
  return arr;
}

io.on('connection', (socket) => {
  let currentUserId: string | null = null;

  socket.on('presence:join', (payload: { userId?: string; displayName?: string } | undefined) => {
    if (!payload || !payload.userId) return;
    currentUserId = String(payload.userId);
    const displayName = typeof payload.displayName === 'string' ? payload.displayName : undefined;
    const prev = players.get(currentUserId);
    const x = prev?.x ?? 800;
    const y = prev?.y ?? 600;
    const player: Player = { userId: currentUserId, displayName, x, y, socketId: socket.id };
    players.set(currentUserId, player);

    socket.emit('presence:state', toStateArray(currentUserId));
    socket.broadcast.emit('presence:joined', { userId: currentUserId, x, y, displayName });
  });

  socket.on('space:position:update', (pos: { x?: number; y?: number } | undefined) => {
    if (!currentUserId || !pos) return;
    const p = players.get(currentUserId);
    if (!p) return;
    const x = Number.isFinite(pos.x) ? (pos.x as number) : p.x;
    const y = Number.isFinite(pos.y) ? (pos.y as number) : p.y;
    p.x = x; p.y = y;
    socket.broadcast.emit('space:position:update', { userId: currentUserId, x, y });
  });

  socket.on('chat:join', (payload: { roomId?: string; userId?: string } | undefined) => {
    if (!payload?.roomId || !payload?.userId) return;
    const { roomId, userId } = payload;
    if (currentUserId !== null && currentUserId !== userId) {
      return;
    }

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
  });

  socket.on('chat:leave', (payload: { roomId?: string; userId?: string } | undefined) => {
    if (!payload?.roomId || !payload?.userId) return;
    const { roomId, userId } = payload;
    socket.leave(roomId);
    const roomMembers = chatRooms.get(roomId);
    const sockets = roomMembers?.get(userId);
    sockets?.delete(socket.id);
    if (sockets && sockets.size === 0) {
      roomMembers?.delete(userId);
    }
    if (roomMembers && roomMembers.size === 0) {
      chatRooms.delete(roomId);
    }
  });

  socket.on(
    'chat:typing',
    (payload: { roomId?: string; userId?: string; state?: 'started' | 'stopped' } | undefined) => {
      if (!payload?.roomId || !payload?.userId || !payload?.state) return;
      const { roomId, userId, state } = payload;
      const roomMembers = chatRooms.get(roomId);
      if (!roomMembers?.get(userId)?.has(socket.id)) return;
      socket.to(roomId).emit('chat:typing', { roomId, userId, state });
    },
  );

  socket.on(
    'chat:message:new',
    (payload: { roomId?: string; userId?: string; message?: unknown } | undefined) => {
      if (!payload?.roomId || !payload?.userId || !payload?.message) return;
      const { roomId, userId, message } = payload;
      const roomMembers = chatRooms.get(roomId);
      if (!roomMembers?.get(userId)?.has(socket.id)) return;
      // TODO: integrate with REST/service layer once persistence pipeline is wired.
      socket.to(roomId).emit('chat:message:new', message);
    },
  );

  socket.on(
    'chat:receipt:update',
    (payload: { roomId?: string; userId?: string; messageId?: string; status?: string } | undefined) => {
      if (!payload?.roomId || !payload?.userId || !payload?.messageId || !payload?.status) return;
      const { roomId, userId, messageId, status } = payload;
      const roomMembers = chatRooms.get(roomId);
      if (!roomMembers?.get(userId)?.has(socket.id)) return;
      socket.to(roomId).emit('chat:receipt:update', { roomId, messageId, userId, status });
    },
  );

  socket.on('voice:join', (payload: { roomId?: string; userId?: string; displayName?: string | null } | undefined) => {
    if (!payload?.roomId || !payload?.userId) return;
    const { roomId, userId, displayName } = payload;
    if (currentUserId !== null && currentUserId !== userId) {
      return;
    }
    const roomMembers = ensureVoiceRoom(roomId);
    if (!roomMembers.has(userId)) {
      roomMembers.set(userId, new Set());
    }
    roomMembers.get(userId)!.add(socket.id);

    const existingParticipants = Array.from(roomMembers.keys()).filter((id) => id !== userId);
    if (existingParticipants.length > 0) {
      socket.emit('voice:participants', { roomId, participants: existingParticipants });
    }
    socket.join(`voice:${roomId}`);
    socket.to(`voice:${roomId}`).emit('voice:userJoined', { roomId, userId, displayName });
  });

  socket.on('voice:leave', (payload: { roomId?: string; userId?: string } | undefined) => {
    if (!payload?.roomId || !payload?.userId) return;
    leaveVoiceRoom(payload.roomId, payload.userId, socket.id);
  });

  socket.on('voice:offer', (payload: { roomId?: string; targetUserId?: string; offer?: RTCSessionDescriptionInit } | undefined) => {
    if (!payload?.roomId || !payload?.targetUserId || !payload?.offer) return;
    if (!currentUserId) return;
    const { roomId, targetUserId, offer } = payload;
    if (!isVoiceMember(roomId, currentUserId, socket.id)) return;
    const targets = voiceRooms.get(roomId)?.get(targetUserId);
    if (!targets) return;
    targets.forEach((targetSocketId) => {
      io.to(targetSocketId).emit('voice:offer', { roomId, fromUserId: currentUserId, offer });
    });
  });

  socket.on('voice:answer', (payload: { roomId?: string; targetUserId?: string; answer?: RTCSessionDescriptionInit } | undefined) => {
    if (!payload?.roomId || !payload?.targetUserId || !payload?.answer) return;
    if (!currentUserId) return;
    const { roomId, targetUserId, answer } = payload;
    if (!isVoiceMember(roomId, currentUserId, socket.id)) return;
    const targets = voiceRooms.get(roomId)?.get(targetUserId);
    if (!targets) return;
    targets.forEach((targetSocketId) => {
      io.to(targetSocketId).emit('voice:answer', { roomId, fromUserId: currentUserId, answer });
    });
  });

  socket.on('voice:iceCandidate', (payload: { roomId?: string; targetUserId?: string; candidate?: RTCIceCandidateInit } | undefined) => {
    if (!payload?.roomId || !payload?.targetUserId || !payload?.candidate) return;
    if (!currentUserId) return;
    const { roomId, targetUserId, candidate } = payload;
    if (!isVoiceMember(roomId, currentUserId, socket.id)) return;
    const targets = voiceRooms.get(roomId)?.get(targetUserId);
    if (!targets) return;
    targets.forEach((targetSocketId) => {
      io.to(targetSocketId).emit('voice:iceCandidate', { roomId, fromUserId: currentUserId, candidate });
    });
  });

  socket.on('disconnect', () => {
    if (!currentUserId) return;
    const prev = players.get(currentUserId);
    if (prev && prev.socketId === socket.id) {
      players.delete(currentUserId);
      socket.broadcast.emit('presence:left', { userId: currentUserId });
    }

    // Clean chat memberships
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
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Realtime server listening on :${PORT} (CORS: ${CORS_ORIGIN})`);
});

export {};

function ensureVoiceRoom(roomId: string): VoiceRoomMembers {
  if (!voiceRooms.has(roomId)) {
    voiceRooms.set(roomId, new Map());
  }
  return voiceRooms.get(roomId)!;
}

function leaveVoiceRoom(roomId: string, userId: string, socketId: string) {
  const roomMembers = voiceRooms.get(roomId);
  if (!roomMembers) return;
  const sockets = roomMembers.get(userId);
  sockets?.delete(socketId);
  if (sockets && sockets.size === 0) {
    roomMembers.delete(userId);
    io.to(`voice:${roomId}`).emit('voice:userLeft', { roomId, userId });
  }
  if (roomMembers.size === 0) {
    voiceRooms.delete(roomId);
  }
}

function isVoiceMember(roomId: string, userId: string, socketId: string): boolean {
  const roomMembers = voiceRooms.get(roomId);
  if (!roomMembers) return false;
  const sockets = roomMembers.get(userId);
  return sockets?.has(socketId) ?? false;
}

