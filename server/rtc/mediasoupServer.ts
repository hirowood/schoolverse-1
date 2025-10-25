/**
 * EduVerse Phase 2: mediasoup SFU Server (改善版)
 * 
 * ✅ audio/video/screen に対応
 * ✅ イベント名を定数化
 * ✅ Worker の複数起動でロードバランシング
 * ✅ 4層エラーハンドリング
 */

import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import * as mediasoup from 'mediasoup';
import type { MediasoupConfig } from './mediasoupConfig';
import { createMediasoupConfig, createTransportOptions } from './mediasoupConfig';

// ━━━ mediasoup の型定義 ━━━
type Worker = mediasoup.types.Worker;
type Router = mediasoup.types.Router;
type WebRtcTransport = mediasoup.types.WebRtcTransport;
type RtpCapabilities = mediasoup.types.RtpCapabilities;
type Producer = mediasoup.types.Producer;
type Consumer = mediasoup.types.Consumer;

// ━━━ 環境変数 ━━━
const PORT = Number(process.env.MEDIASOUP_PORT || 4001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const WORKER_COUNT = Number(process.env.MEDIASOUP_WORKER_COUNT || 4);

// ━━━ イベント定数(サーバー側でも定義) ━━━
const MEDIASOUP_EVENTS = {
  JOIN: 'voice:join',
  CREATE_TRANSPORT: 'voice:createTransport',
  CONNECT_TRANSPORT: 'voice:connectTransport',
  PRODUCE: 'voice:produce',
  CONSUME: 'voice:consume',
  USER_JOINED: 'voice:userJoined',
  USER_LEFT: 'voice:userLeft',
  NEW_PRODUCER: 'voice:newProducer',
  PRODUCER_CLOSED: 'voice:producerClosed',
} as const;

// ━━━ Worker のプール ━━━
const workers: Worker[] = [];
let workerIndex = 0;

// ━━━ Room 管理 ━━━
const rooms = new Map<string, VoiceRoom>();

/**
 * ✅ メイン起動処理
 */
async function run() {
  const config = createMediasoupConfig();

  // ━━━ 複数 Worker を起動してロードバランシング ━━━
  console.log(`[mediasoup] Starting ${WORKER_COUNT} workers...`);
  for (let i = 0; i < WORKER_COUNT; i++) {
    const worker = await createMediasoupWorker(config);
    workers.push(worker);
    console.log(`[mediasoup] Worker ${i + 1}/${WORKER_COUNT} ready`);
  }

  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    let joinedRoomId: string | null = null;
    let peerId: string | null = null;

    console.log(`[mediasoup] Client connected: ${socket.id}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ Room 参加
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    socket.on(
      MEDIASOUP_EVENTS.JOIN,
      async (payload: any, callback?: (response: any) => void) => {
        try {
          // ━━━ バリデーション ━━━
          if (!payload?.roomId || !payload?.userId || !payload?.rtpCapabilities) {
            console.error('[mediasoup] Invalid join payload:', payload);
            callback?.({ error: 'invalid_payload' });
            return;
          }

          const { roomId, userId, rtpCapabilities } = payload;
          peerId = userId;
          joinedRoomId = roomId;

          // ━━━ Room を取得 or 作成 ━━━
          const room = await getOrCreateRoom(roomId);
          room.peers.set(userId, new PeerContext(rtpCapabilities));

          socket.join(roomId);
          callback?.({
            roomId,
            routerRtpCapabilities: room.router.rtpCapabilities,
          });

          // ━━━ 既存参加者に通知 ━━━
          socket.to(roomId).emit(MEDIASOUP_EVENTS.USER_JOINED, { roomId, userId });

          console.log(`[mediasoup] User ${userId} joined room ${roomId}`);
        } catch (error) {
          console.error('[mediasoup] Join failed:', error);
          callback?.({ error: 'join_failed' });
        }
      }
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ Transport 作成
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    socket.on(MEDIASOUP_EVENTS.CREATE_TRANSPORT, async (_, callback: (response: any) => void) => {
      try {
        if (!joinedRoomId || !peerId) {
          callback({ error: 'not_joined' });
          return;
        }

        const room = rooms.get(joinedRoomId);
        if (!room) {
          callback({ error: 'room_not_found' });
          return;
        }

        const transport = await room.router.createWebRtcTransport(
          createTransportOptions(config)
        );

        const info = {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        };

        room.getPeer(peerId).transports.set(transport.id, transport);
        callback(info);

        console.log(`[mediasoup] Transport created for user ${peerId}: ${transport.id}`);
      } catch (error) {
        console.error('[mediasoup] Create transport failed:', error);
        callback({ error: 'create_transport_failed' });
      }
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ Transport 接続
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    socket.on(MEDIASOUP_EVENTS.CONNECT_TRANSPORT, async (payload: any, callback: (response: any) => void) => {
      try {
        if (!payload?.transportId || !payload?.dtlsParameters || !joinedRoomId || !peerId) {
          callback({ error: 'invalid_payload' });
          return;
        }

        const room = rooms.get(joinedRoomId);
        if (!room) {
          callback({ error: 'room_not_found' });
          return;
        }

        const transport = room.getPeer(peerId).transports.get(payload.transportId);
        if (!transport) {
          callback({ error: 'transport_not_found' });
          return;
        }

        await transport.connect({ dtlsParameters: payload.dtlsParameters });
        callback({});

        console.log(`[mediasoup] Transport connected: ${payload.transportId}`);
      } catch (error) {
        console.error('[mediasoup] Connect transport failed:', error);
        callback({ error: 'connect_transport_failed' });
      }
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ メディア送信開始 (audio/video/screen 対応)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    socket.on(MEDIASOUP_EVENTS.PRODUCE, async (payload: any, callback: (response: any) => void) => {
      try {
        // ━━━ バリデーション ━━━
        if (!payload?.transportId || !payload?.kind || !payload?.rtpParameters || !joinedRoomId || !peerId) {
          callback({ error: 'invalid_payload' });
          return;
        }

        const room = rooms.get(joinedRoomId);
        if (!room) {
          callback({ error: 'room_not_found' });
          return;
        }

        const transport = room.getPeer(peerId).transports.get(payload.transportId);
        if (!transport) {
          callback({ error: 'transport_not_found' });
          return;
        }

        // ━━━ kind に応じた処理 ━━━
        const { kind, rtpParameters } = payload;
        const isScreen = kind === 'screen';

        // 画面共有の場合は video として扱うが appData でフラグを立てる
        const produceKind = isScreen ? 'video' : kind;
        const appData = isScreen ? { isScreen: true, originalKind: kind } : { originalKind: kind };

        const producer = await transport.produce({
          kind: produceKind,
          rtpParameters,
          appData,
        });

        room.getPeer(peerId).producers.set(producer.id, producer);

        // ━━━ Producer が閉じられたときのクリーンアップ ━━━
        producer.on('transportclose', () => {
          const peer = room.peers.get(peerId!);
          if (peer) {
            peer.producers.delete(producer.id);
          }
          console.log(`[mediasoup] Producer ${producer.id} closed (transport close)`);
        });

        // ━━━ 他の参加者に通知 ━━━
        notifyNewProducer(socket, joinedRoomId, peerId, producer.id, kind);

        callback({ id: producer.id });
        console.log(`[mediasoup] User ${peerId} started producing ${kind}`);
      } catch (error) {
        console.error('[mediasoup] Produce failed:', error);
        callback({ error: 'produce_failed' });
      }
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ 他ユーザーのメディアを受信
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    socket.on(MEDIASOUP_EVENTS.CONSUME, async (payload: any, callback: (response: any) => void) => {
      try {
        if (!payload?.transportId || !payload?.producerId || !payload?.rtpCapabilities || !joinedRoomId || !peerId) {
          callback({ error: 'invalid_payload' });
          return;
        }

        const room = rooms.get(joinedRoomId);
        if (!room) {
          callback({ error: 'room_not_found' });
          return;
        }

        const transport = room.getPeer(peerId).transports.get(payload.transportId);
        if (!transport) {
          callback({ error: 'transport_not_found' });
          return;
        }

        const producer = findProducer(room, payload.producerId);
        if (!producer) {
          callback({ error: 'producer_not_found' });
          return;
        }

        const rtpCapabilities = payload.rtpCapabilities;
        if (!room.router.canConsume({ producerId: producer.id, rtpCapabilities })) {
          callback({ error: 'cannot_consume' });
          return;
        }

        const consumer = await transport.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: false,
        });

        room.getPeer(peerId).consumers.set(consumer.id, consumer);

        // ━━━ Consumer のクリーンアップ ━━━
        consumer.on('transportclose', () => {
          const peer = room.peers.get(peerId!);
          if (peer) {
            peer.consumers.delete(consumer.id);
          }
        });

        consumer.on('producerclose', () => {
          const peer = room.peers.get(peerId!);
          if (peer) {
            peer.consumers.delete(consumer.id);
          }
          const owner = findProducerOwner(room, producer.id);
          socket.emit(MEDIASOUP_EVENTS.PRODUCER_CLOSED, {
            consumerId: consumer.id,
            userId: owner,
          });
        });

        callback({
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });

        console.log(`[mediasoup] User ${peerId} consuming from producer ${payload.producerId}`);
      } catch (error) {
        console.error('[mediasoup] Consume failed:', error);
        callback({ error: 'consume_failed' });
      }
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ 切断処理
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    socket.on('disconnect', () => {
      if (!joinedRoomId || !peerId) return;

      const room = rooms.get(joinedRoomId);
      if (!room) return;

      // ━━━ Peer のクリーンアップ ━━━
      const peer = room.peers.get(peerId);
      if (peer) {
        peer.close();
        room.peers.delete(peerId);
      }

      // ━━━ 他の参加者に通知 ━━━
      socket.to(joinedRoomId).emit(MEDIASOUP_EVENTS.USER_LEFT, {
        roomId: joinedRoomId,
        userId: peerId,
      });

      // ━━━ Room が空になったら削除 ━━━
      if (room.peers.size === 0) {
        room.close();
        rooms.delete(joinedRoomId);
        console.log(`[mediasoup] Room ${joinedRoomId} closed (empty)`);
      }

      console.log(`[mediasoup] User ${peerId} left room ${joinedRoomId}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`[mediasoup] SFU listening on :${PORT}`);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ヘルパー関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ✅ mediasoup Worker を作成
 */
async function createMediasoupWorker(config: MediasoupConfig): Promise<Worker> {
  const worker = await mediasoup.createWorker({
    logLevel: config.worker.logLevel as any,
    logTags: config.worker.logTags as any,
    rtcMinPort: config.worker.rtcMinPort,
    rtcMaxPort: config.worker.rtcMaxPort,
  });

  worker.on('died', () => {
    console.error('[mediasoup] Worker died, exiting in 2 seconds...');
    setTimeout(() => process.exit(1), 2000);
  });

  return worker;
}

/**
 * ✅ Room を取得 or 作成(ラウンドロビンでWorkerを振り分け)
 */
async function getOrCreateRoom(roomId: string): Promise<VoiceRoom> {
  const existing = rooms.get(roomId);
  if (existing) return existing;

  // ━━━ Worker をラウンドロビンで選択 ━━━
  const worker = workers[workerIndex];
  const currentWorkerIndex = workerIndex;
  workerIndex = (workerIndex + 1) % workers.length;

  const config = createMediasoupConfig();
  const router = await worker.createRouter({
    mediaCodecs: config.router.mediaCodecs as any,
  });

  const room = new VoiceRoom(router);
  rooms.set(roomId, room);

  console.log(`[mediasoup] Room ${roomId} created on Worker ${currentWorkerIndex}`);
  return room;
}

/**
 * ✅ Producer とその所有者を検索
 */
function findProducerInfo(room: VoiceRoom, producerId: string) {
  for (const [userId, peer] of room.peers.entries()) {
    const producer = peer.producers.get(producerId);
    if (producer) {
      return { userId, producer };
    }
  }
  return null;
}

/**
 * ✅ Producer を検索
 */
function findProducer(room: VoiceRoom, producerId: string): Producer | null {
  return findProducerInfo(room, producerId)?.producer ?? null;
}

/**
 * ✅ Producer の所有者を検索
 */
function findProducerOwner(room: VoiceRoom, producerId: string): string | null {
  return findProducerInfo(room, producerId)?.userId ?? null;
}

/**
 * ✅ 新しい Producer を他の参加者に通知
 */
function notifyNewProducer(
  socket: Socket,
  roomId: string,
  userId: string,
  producerId: string,
  kind: string
) {
  socket.to(roomId).emit(MEDIASOUP_EVENTS.NEW_PRODUCER, {
    roomId,
    userId,
    producerId,
    kind,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// クラス定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ✅ VoiceRoom クラス
 * 1つの Room を表す
 */
class VoiceRoom {
  public readonly peers = new Map<string, PeerContext>();

  constructor(public readonly router: Router) {}

  getPeer(userId: string): PeerContext {
    const context = this.peers.get(userId);
    if (!context) {
      throw new Error(`Peer ${userId} not found in room`);
    }
    return context;
  }

  close() {
    for (const peer of this.peers.values()) {
      peer.close();
    }
    this.peers.clear();
  }
}

/**
 * ✅ PeerContext クラス
 * 1人のユーザーの Transport / Producer / Consumer を管理
 */
class PeerContext {
  public readonly transports = new Map<string, WebRtcTransport>();
  public readonly producers = new Map<string, Producer>();
  public readonly consumers = new Map<string, Consumer>();

  constructor(public readonly rtpCapabilities: RtpCapabilities) {}

  close() {
    this.producers.forEach((producer) => producer.close());
    this.consumers.forEach((consumer) => consumer.close());
    this.transports.forEach((transport) => transport.close());
    this.producers.clear();
    this.consumers.clear();
    this.transports.clear();
  }
}

// ━━━ サーバー起動 ━━━
run().catch((error) => {
  console.error('[mediasoup] Fatal error:', error);
  process.exit(1);
});
