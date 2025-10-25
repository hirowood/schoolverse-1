/**
 * EduVerse Phase 2: MediasoupClient (改善版)
 * 
 * mediasoup-client を使った SFU クライアント実装
 * ✅ audio/video/screen に対応
 * ✅ イベントベースのAPI
 * ✅ 適切なクリーンアップ処理
 */

'use client';

import { Device } from 'mediasoup-client';
import type { Transport, Producer, Consumer } from 'mediasoup-client/lib/types';
import type { Socket } from 'socket.io-client';
import { MEDIASOUP_EVENTS } from '@/constants/mediasoup-events';
import type { MediaKind } from '@/types/mediasoup';

export type MediasoupClientOptions = {
  socket: Socket;
};

type MediasoupClientEventMap = {
  'remote-track': { userId: string; stream: MediaStream; kind: MediaKind };
  'producer-closed': { consumerId: string; userId?: string };
  error: { error: Error };
};

type EventKey = keyof MediasoupClientEventMap;
type Listener<T extends EventKey> = (payload: MediasoupClientEventMap[T]) => void;

/**
 * ✅ MediasoupClient
 * 
 * mediasoup-client を使った SFU クライアント実装
 */
export class MediasoupClient {
  private readonly socket: Socket;
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private joinedRoomId: string | null = null;

  // ━━━ Producer 管理 ━━━
  private audioProducer: Producer | null = null;
  private videoProducer: Producer | null = null;
  private screenProducer: Producer | null = null;

  // ━━━ Consumer 管理 ━━━
  private consumers = new Map<string, Consumer>();
  private consumerOwners = new Map<string, string>();

  // ━━━ イベントリスナー ━━━
  private listeners = new Map<EventKey, Set<Listener<EventKey>>>();

  constructor(options: MediasoupClientOptions) {
    this.socket = options.socket;
  }

  /**
   * ✅ イベントリスナーを登録
   */
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

  /**
   * ✅ Room に参加
   */
  async joinRoom(payload: {
    roomId: string;
    userId: string;
    audioStream?: MediaStream;
  }): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Media devices are not available');
    }

    if (this.joinedRoomId === payload.roomId) {
      console.warn('[MediasoupClient] Already joined this room');
      return;
    }

    // ━━━ Device を初期化 ━━━
    if (!this.device) {
      this.device = new Device();
    }

    // ━━━ Server に参加リクエスト ━━━
    interface JoinRoomResponse {
      routerRtpCapabilities: unknown;
      sendTransport?: unknown;
      recvTransport?: unknown;
    }

    const response = await new Promise<JoinRoomResponse>((resolve, reject) => {
      this.socket.emit(
        MEDIASOUP_EVENTS.JOIN,
        {
          roomId: payload.roomId,
          userId: payload.userId,
          rtpCapabilities: this.device!.rtpCapabilities || undefined,
        },
        (data: unknown) => {
          if (!data || typeof data !== 'object' || !('routerRtpCapabilities' in data)) {
            reject(new Error('Failed to join room'));
            return;
          }
          resolve(data);
        }
      );
    });

    // ━━━ Device を load ━━━
    if (!this.device.loaded) {
      await this.device.load({ routerRtpCapabilities: response.routerRtpCapabilities });
    }

    this.joinedRoomId = payload.roomId;

    // ━━━ Transport を作成 ━━━
    await this.createTransports();

    // ━━━ 音声を送信 ━━━
    if (payload.audioStream) {
      const [audioTrack] = payload.audioStream.getAudioTracks();
      if (audioTrack) {
        await this.produceTrack(audioTrack, 'audio');
      }
    }

    // ━━━ イベントリスナーを登録 ━━━
    this.registerSocketEvents();

    console.log('[MediasoupClient] Joined room:', payload.roomId);
  }

  /**
   * ✅ Room から退出
   */
  async leaveRoom(): Promise<void> {
    this.sendTransport?.close();
    this.recvTransport?.close();

    this.audioProducer?.close();
    this.videoProducer?.close();
    this.screenProducer?.close();

    this.consumers.forEach((consumer) => consumer.close());
    this.consumers.clear();
    this.consumerOwners.clear();

    this.sendTransport = null;
    this.recvTransport = null;
    this.audioProducer = null;
    this.videoProducer = null;
    this.screenProducer = null;
    this.joinedRoomId = null;

    this.socket.off(MEDIASOUP_EVENTS.NEW_PRODUCER);
    this.socket.off(MEDIASOUP_EVENTS.PRODUCER_CLOSED);

    console.log('[MediasoupClient] Left room');
  }

  /**
   * ✅ カメラを有効化
   */
  async enableCamera(): Promise<void> {
    if (this.videoProducer) {
      console.warn('[MediasoupClient] Camera already enabled');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
    });

    const [track] = stream.getVideoTracks();
    await this.produceTrack(track, 'video');

    console.log('[MediasoupClient] Camera enabled');
  }

  /**
   * ✅ カメラを停止
   */
  async disableCamera(): Promise<void> {
    if (!this.videoProducer) return;

    this.videoProducer.track?.stop();
    this.videoProducer.close();
    this.videoProducer = null;

    console.log('[MediasoupClient] Camera disabled');
  }

  /**
   * ✅ 画面共有を開始
   */
  async startScreenShare(): Promise<void> {
    if (this.screenProducer) {
      console.warn('[MediasoupClient] Screen share already started');
      return;
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
    });

    const [track] = stream.getVideoTracks();

    // ユーザーが停止ボタンを押したときの処理
    track.onended = () => {
      this.stopScreenShare();
    };

    await this.produceTrack(track, 'screen');

    console.log('[MediasoupClient] Screen share started');
  }

  /**
   * ✅ 画面共有を停止
   */
  async stopScreenShare(): Promise<void> {
    if (!this.screenProducer) return;

    this.screenProducer.track?.stop();
    this.screenProducer.close();
    this.screenProducer = null;

    console.log('[MediasoupClient] Screen share stopped');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // プライベートメソッド
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ Transport を作成
   */
  private async createTransports(): Promise<void> {
    if (!this.device) throw new Error('Device not initialized');

    // ━━━ Send Transport ━━━
    const sendInfo = await this.requestTransportInfo();
    this.sendTransport = await this.device.createSendTransport(sendInfo);
    this.handleSendTransportEvents(this.sendTransport);

    // ━━━ Recv Transport ━━━
    const recvInfo = await this.requestTransportInfo();
    this.recvTransport = await this.device.createRecvTransport(recvInfo);
    this.handleRecvTransportEvents(this.recvTransport);
  }

  /**
   * ✅ Transport 情報をリクエスト
   */
  private async requestTransportInfo(): Promise<unknown> {
    return await new Promise((resolve) => {
      this.socket.emit(MEDIASOUP_EVENTS.CREATE_TRANSPORT, null, resolve);
    });
  }

  /**
   * ✅ Send Transport のイベントハンドリング
   */
  private handleSendTransportEvents(transport: Transport): void {
    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      this.socket.emit(
        MEDIASOUP_EVENTS.CONNECT_TRANSPORT,
        { transportId: transport.id, dtlsParameters },
        (response: { error?: string }) => {
          if (response?.error) {
            errback(new Error(response.error));
          } else {
            callback();
          }
        }
      );
    });

    transport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
      this.socket.emit(
        MEDIASOUP_EVENTS.PRODUCE,
        { transportId: transport.id, kind, rtpParameters },
        (response: { id?: string; error?: string }) => {
          if (response?.error || !response?.id) {
            errback(new Error(response?.error ?? 'produce_failed'));
          } else {
            callback({ id: response.id });
          }
        }
      );
    });
  }

  /**
   * ✅ Recv Transport のイベントハンドリング
   */
  private handleRecvTransportEvents(transport: Transport): void {
    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      this.socket.emit(
        MEDIASOUP_EVENTS.CONNECT_TRANSPORT,
        { transportId: transport.id, dtlsParameters },
        (response: { error?: string }) => {
          if (response?.error) {
            errback(new Error(response.error));
          } else {
            callback();
          }
        }
      );
    });
  }

  /**
   * ✅ Track を送信
   */
  private async produceTrack(track: MediaStreamTrack, kind: MediaKind): Promise<void> {
    if (!this.sendTransport) throw new Error('Send transport not ready');

    const producer = await this.sendTransport.produce({ track });

    // ━━━ Producer を保存 ━━━
    switch (kind) {
      case 'audio':
        this.audioProducer = producer;
        break;
      case 'video':
        this.videoProducer = producer;
        break;
      case 'screen':
        this.screenProducer = producer;
        break;
    }

    producer.on('transportclose', () => {
      console.log(`[MediasoupClient] Producer ${kind} closed (transport close)`);
    });
  }

  /**
   * ✅ Socket イベントを登録
   */
  private registerSocketEvents(): void {
    this.socket.on(
      MEDIASOUP_EVENTS.NEW_PRODUCER,
      async (data: { roomId: string; userId: string; producerId: string; kind: MediaKind }) => {
        if (data.roomId !== this.joinedRoomId) return;
        await this.consume(data.producerId, data.kind, data.userId);
      }
    );

    this.socket.on(MEDIASOUP_EVENTS.PRODUCER_CLOSED, ({ consumerId }: { consumerId: string }) => {
      const consumer = this.consumers.get(consumerId);
      consumer?.close();
      this.consumers.delete(consumerId);

      const owner = this.consumerOwners.get(consumerId);
      this.consumerOwners.delete(consumerId);

      this.emit('producer-closed', { consumerId, userId: owner });
    });
  }

  /**
   * ✅ 他ユーザーのメディアを受信
   */
  private async consume(producerId: string, kind: MediaKind, ownerUserId: string): Promise<void> {
    if (!this.recvTransport || !this.device) return;

    const rtpCapabilities = this.device.rtpCapabilities;
    interface ConsumeResponse {
      error?: string;
      id?: string;
      kind?: string;
      rtpParameters?: unknown;
    }
    const response = await new Promise<ConsumeResponse>((resolve) => {
      this.socket.emit(
        MEDIASOUP_EVENTS.CONSUME,
        { transportId: this.recvTransport!.id, producerId, rtpCapabilities },
        resolve
      );
    });

    if (response?.error || !response?.id || !response.rtpParameters) {
      console.error('[MediasoupClient] Consume failed:', response?.error);
      return;
    }

    const consumer = await this.recvTransport.consume({
      id: response.id,
      producerId,
      kind: response.kind,
      rtpParameters: response.rtpParameters,
    });

    this.consumers.set(consumer.id, consumer);
    this.consumerOwners.set(consumer.id, ownerUserId);

    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    this.emit('remote-track', { userId: ownerUserId, stream, kind });
  }

  /**
   * ✅ イベントを発火
   */
  private emit<T extends EventKey>(event: T, payload: MediasoupClientEventMap[T]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((listener) => {
      listener(payload as MediasoupClientEventMap[T]);
    });
  }
}
