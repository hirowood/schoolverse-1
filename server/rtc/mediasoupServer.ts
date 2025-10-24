import { createServer } from "http";
import { Server } from "socket.io";
import {
  createWorker,
  type Worker,
  type Router,
  type WebRtcTransport,
  type RtpCapabilities,
  type Producer,
  type Consumer,
} from "mediasoup";
import type { MediasoupConfig } from "./mediasoupConfig";
import { createMediasoupConfig, createTransportOptions } from "./mediasoupConfig";

const PORT = Number(process.env.MEDIASOUP_PORT || 4001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const rooms = new Map<string, VoiceRoom>();

async function run() {
  const config = createMediasoupConfig();
  const worker = await createMediasoupWorker(config);
  const router = await worker.createRouter(config.router);

  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    let joinedRoomId: string | null = null;
    let peerId: string | null = null;

    socket.on("voice:join", async (payload: { roomId?: string; userId?: string; rtpCapabilities?: RtpCapabilities }) => {
      if (!payload?.roomId || !payload?.userId || !payload?.rtpCapabilities) return;
      const { roomId, userId, rtpCapabilities } = payload;
      peerId = userId;
      joinedRoomId = roomId;

      const room = await getOrCreateRoom(roomId, router);
      room.peers.set(userId, new PeerContext(rtpCapabilities));

      socket.join(roomId);
      socket.emit("voice:joined", { roomId, routerRtpCapabilities: router.rtpCapabilities });
      socket.to(roomId).emit("voice:userJoined", { roomId, userId });
    });

    socket.on("voice:createTransport", async (_, callback: (response: TransportInfoResponse | ErrorResponse) => void) => {
      if (!joinedRoomId || !peerId) return callback({ error: "not_joined" });
      const room = rooms.get(joinedRoomId);
      if (!room) return callback({ error: "room_not_found" });

      try {
        const transport = await room.router.createWebRtcTransport(createTransportOptions(config));
        const info: TransportInfoResponse = {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        };
        room.getPeer(peerId).transports.set(transport.id, transport);
        callback(info);
      } catch (error) {
        console.error("[mediasoup] createTransport failed", error);
        callback({ error: "create_transport_failed" });
      }
    });

    socket.on("voice:connectTransport", async (payload: { transportId?: string; dtlsParameters?: unknown }, callback: (response: { error?: string }) => void) => {
      if (!payload?.transportId || !payload?.dtlsParameters || !joinedRoomId || !peerId) return callback({ error: "invalid_payload" });
      const room = rooms.get(joinedRoomId);
      if (!room) return callback({ error: "room_not_found" });
      const transport = room.getPeer(peerId).transports.get(payload.transportId);
      if (!transport) return callback({ error: "transport_not_found" });
      try {
        await transport.connect({ dtlsParameters: payload.dtlsParameters as any });
        callback({});
      } catch (error) {
        console.error("[mediasoup] connectTransport failed", error);
        callback({ error: "connect_transport_failed" });
      }
    });

    socket.on("voice:produce", async (payload: { transportId?: string; kind?: "audio" | "video"; rtpParameters?: any }, callback: (response: { id?: string; error?: string }) => void) => {
      if (!payload?.transportId || !payload?.kind || !payload?.rtpParameters || !joinedRoomId || !peerId) return callback({ error: "invalid_payload" });
      const room = rooms.get(joinedRoomId);
      if (!room) return callback({ error: "room_not_found" });
      const transport = room.getPeer(peerId).transports.get(payload.transportId);
      if (!transport) return callback({ error: "transport_not_found" });
      try {
        const producer = await transport.produce({ kind: payload.kind, rtpParameters: payload.rtpParameters });
        room.getPeer(peerId).producers.set(producer.id, producer);
        producer.on("transportclose", () => {
          room.getPeer(peerId).producers.delete(producer.id);
        });
        broadcastNewProducer(io, joinedRoomId, peerId, producer.id, payload.kind);
        callback({ id: producer.id });
      } catch (error) {
        console.error("[mediasoup] produce failed", error);
        callback({ error: "produce_failed" });
      }
    });

    socket.on("voice:consume", async (payload: { transportId?: string; producerId?: string; rtpCapabilities?: RtpCapabilities }, callback: (response: { id?: string; kind?: "audio" | "video"; rtpParameters?: any; error?: string }) => void) => {
      if (!payload?.transportId || !payload?.producerId || !payload?.rtpCapabilities || !joinedRoomId || !peerId) {
        return callback({ error: "invalid_payload" });
      }
      const room = rooms.get(joinedRoomId);
      if (!room) return callback({ error: "room_not_found" });
      const transport = room.getPeer(peerId).transports.get(payload.transportId);
      if (!transport) return callback({ error: "transport_not_found" });
      const producer = findProducer(room, payload.producerId);
      if (!producer) return callback({ error: "producer_not_found" });
      const rtpCapabilities = payload.rtpCapabilities;
      if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
        return callback({ error: "cannot_consume" });
      }
      try {
        const consumer = await transport.consume({ producerId: producer.id, rtpCapabilities, paused: false });
        room.getPeer(peerId).consumers.set(consumer.id, consumer);
        consumer.on("transportclose", () => {
          room.getPeer(peerId).consumers.delete(consumer.id);
        });
        consumer.on("producerclose", () => {
          room.getPeer(peerId).consumers.delete(consumer.id);
          socket.emit("voice:producerClosed", { consumerId: consumer.id });
        });
        callback({ id: consumer.id, kind: consumer.kind, rtpParameters: consumer.rtpParameters });
      } catch (error) {
        console.error("[mediasoup] consume failed", error);
        callback({ error: "consume_failed" });
      }
    });

    socket.on("disconnect", () => {
      if (!joinedRoomId || !peerId) return;
      const room = rooms.get(joinedRoomId);
      if (!room) return;
      const peer = room.getPeer(peerId);
      peer?.close();
      room.peers.delete(peerId);
      socket.to(joinedRoomId).emit("voice:userLeft", { roomId: joinedRoomId, userId: peerId });
      if (room.peers.size === 0) {
        room.close();
        rooms.delete(joinedRoomId);
      }
    });
  });

  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[mediasoup] SFU listening on :${PORT}`);
  });
}

run().catch((error) => {
  console.error("[mediasoup] fatal error", error);
  process.exit(1);
});

async function createMediasoupWorker(config: MediasoupConfig): Promise<Worker> {
  const worker = await createWorker({
    logLevel: config.worker.logLevel,
    logTags: config.worker.logTags,
    rtcMinPort: config.worker.rtcMinPort,
    rtcMaxPort: config.worker.rtcMaxPort,
  });
  worker.on("died", () => {
    console.error("[mediasoup] worker died, exiting in 2 seconds...");
    setTimeout(() => process.exit(1), 2000);
  });
  return worker;
}

class VoiceRoom {
  constructor(public readonly router: Router) {}
  public readonly peers = new Map<string, PeerContext>();

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

async function getOrCreateRoom(roomId: string, router: Router) {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  const room = new VoiceRoom(router);
  rooms.set(roomId, room);
  return room;
}

function findProducer(room: VoiceRoom, producerId: string) {
  for (const peer of room.peers.values()) {
    if (peer.producers.has(producerId)) {
      return peer.producers.get(producerId)!;
    }
  }
  return null;
}

function broadcastNewProducer(io: Server, roomId: string, userId: string, producerId: string, kind: "audio" | "video") {
  io.to(roomId).emit("voice:newProducer", { roomId, userId, producerId, kind });
}

type TransportInfoResponse = {
  id: string;
  iceParameters: any;
  iceCandidates: any;
  dtlsParameters: any;
};

type ErrorResponse = { error: string };
