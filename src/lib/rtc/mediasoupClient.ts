"use client";

import { Device } from "mediasoup-client";
import type { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import type { Transport } from "mediasoup-client/lib/Transport";
import type { Consumer } from "mediasoup-client/lib/Consumer";
import type { Producer } from "mediasoup-client/lib/Producer";
import type { Socket } from "socket.io-client";

export type MediasoupClientOptions = {
  socket: Socket;
};

type TransportInfo = {
  id: string;
  iceParameters: any;
  iceCandidates: any;
  dtlsParameters: any;
};

type MediasoupClientEventMap = {
  "remote-track": { userId: string; stream: MediaStream };
  "producer-closed": { consumerId: string; userId?: string };
  error: { error: Error };
};

type EventKey = keyof MediasoupClientEventMap;
type Listener<T extends EventKey> = (payload: MediasoupClientEventMap[T]) => void;

export class MediasoupClient {
  private readonly socket: Socket;
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private joinedRoomId: string | null = null;
  private producers = new Map<string, Producer>();
  private consumers = new Map<string, Consumer>();
  private consumerOwners = new Map<string, string>();
  private listeners = new Map<EventKey, Set<Listener<EventKey>>>();

  constructor(options: MediasoupClientOptions) {
    this.socket = options.socket;
  }

  on<T extends EventKey>(event: T, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    // @ts-expect-error - Set handles typed listener
    set.add(listener);
    return () => {
      // @ts-expect-error - same reasoning as above
      set.delete(listener);
    };
  }

  async joinRoom(payload: { roomId: string; userId: string; stream: MediaStream }): Promise<{ routerRtpCapabilities: RtpCapabilities }> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Media devices are not available in this environment.");
    }

    if (this.joinedRoomId === payload.roomId) {
      return { routerRtpCapabilities: this.device?.rtpCapabilities ?? ({} as RtpCapabilities) };
    }
    const response: { roomId: string; routerRtpCapabilities: RtpCapabilities } = await new Promise((resolve, reject) => {
      this.socket.emit("voice:join", { roomId: payload.roomId, userId: payload.userId, displayName: payload.userId }, (data: unknown) => {
        if (!data || typeof data !== "object" || !("routerRtpCapabilities" in data)) {
          reject(new Error("Failed to join voice room"));
          return;
        }
        resolve(data as { roomId: string; routerRtpCapabilities: RtpCapabilities });
      });
    });

    if (!this.device) {
      this.device = new Device();
      await this.device.load({ routerRtpCapabilities: response.routerRtpCapabilities });
    }
    this.joinedRoomId = payload.roomId;

    const sendInfo = await this.requestTransportInfo();
    this.sendTransport = await this.device.createSendTransport(sendInfo);
    this.handleSendTransportEvents(this.sendTransport);

    const recvInfo = await this.requestTransportInfo();
    this.recvTransport = await this.device.createRecvTransport(recvInfo);
    this.handleRecvTransportEvents(this.recvTransport);

    for (const track of payload.stream.getTracks()) {
      await this.produce(track);
    }

    this.socket.on("voice:newProducer", async (data: { roomId: string; userId: string; producerId: string; kind: "audio" | "video" }) => {
      if (data.roomId !== this.joinedRoomId) return;
      await this.consume(data.producerId, data.kind, data.userId);
    });

    this.socket.on("voice:producerClosed", ({ consumerId }: { consumerId: string }) => {
      const consumer = this.consumers.get(consumerId);
      consumer?.close();
      this.consumers.delete(consumerId);
      const owner = this.consumerOwners.get(consumerId);
      this.consumerOwners.delete(consumerId);
      this.emit("producer-closed", { consumerId, userId: owner });
    });

    return response;
  }

  async leaveRoom() {
    this.sendTransport?.close();
    this.recvTransport?.close();
    this.producers.forEach((producer) => producer.close());
    this.consumers.forEach((consumer) => consumer.close());
    this.producers.clear();
    this.consumers.clear();
    this.consumerOwners.clear();
    this.sendTransport = null;
    this.recvTransport = null;
    this.joinedRoomId = null;
    this.socket.off("voice:newProducer");
    this.socket.off("voice:producerClosed");
  }

  private async requestTransportInfo(): Promise<TransportInfo> {
    return await new Promise((resolve) => {
      this.socket.emit("voice:createTransport", null, resolve);
    });
  }

  private handleSendTransportEvents(transport: Transport) {
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      this.socket.emit("voice:connectTransport", { transportId: transport.id, dtlsParameters }, (response: { error?: string }) => {
        if (response?.error) {
          errback(new Error(response.error));
        } else {
          callback();
        }
      });
    });

    transport.on("produce", ({ kind, rtpParameters }, callback, errback) => {
      this.socket.emit(
        "voice:produce",
        { transportId: transport.id, kind, rtpParameters },
        (response: { id?: string; error?: string }) => {
          if (response?.error || !response?.id) {
            errback(new Error(response?.error ?? "produce_failed"));
          } else {
            callback({ id: response.id });
          }
        },
      );
    });
  }

  private handleRecvTransportEvents(transport: Transport) {
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      this.socket.emit("voice:connectTransport", { transportId: transport.id, dtlsParameters }, (response: { error?: string }) => {
        if (response?.error) {
          errback(new Error(response.error));
        } else {
          callback();
        }
      });
    });
  }

  private async produce(track: MediaStreamTrack) {
    if (!this.sendTransport) return;
    const producer = await this.sendTransport.produce({ track });
    this.producers.set(producer.id, producer);
    producer.on("transportclose", () => {
      this.producers.delete(producer.id);
    });
  }

  private async consume(producerId: string, kind: "audio" | "video", ownerUserId: string) {
    if (!this.recvTransport || !this.device) return;
    const rtpCapabilities = this.device.rtpCapabilities;
    const response: { id?: string; kind?: "audio" | "video"; rtpParameters?: any; error?: string } = await new Promise((resolve) => {
      this.socket.emit(
        "voice:consume",
        { transportId: this.recvTransport!.id, producerId, rtpCapabilities },
        resolve,
      );
    });
    if (response?.error || !response?.id || !response.rtpParameters) return;
    const consumer = await this.recvTransport.consume({
      id: response.id,
      producerId,
      kind,
      rtpParameters: response.rtpParameters,
    });
    this.consumers.set(consumer.id, consumer);
    this.consumerOwners.set(consumer.id, ownerUserId);
    const stream = new MediaStream();
    stream.addTrack(consumer.track);
    this.emit("remote-track", { userId: ownerUserId, stream });
  }

  private emit<T extends EventKey>(event: T, payload: MediasoupClientEventMap[T]) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((listener) => {
      // @ts-expect-error runtime dispatch
      listener(payload);
    });
  }
}
