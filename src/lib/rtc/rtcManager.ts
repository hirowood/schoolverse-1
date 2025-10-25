"use client";

import type { Socket } from "socket.io-client";
import type {
  VoiceAnswerPayload,
  VoiceAnswerReceivedPayload,
  VoiceIceCandidatePayload,
  VoiceIceCandidateReceivedPayload,
  VoiceJoinPayload,
  VoiceLeavePayload,
  VoiceOfferPayload,
  VoiceOfferReceivedPayload,
  VoiceParticipantsPayload,
  VoiceUserId,
  VoiceUserJoinedPayload,
  VoiceUserLeftPayload,
} from "@/types/rtc";

type RTCManagerEventMap = {
  "local-stream": MediaStream;
  "remote-track": { userId: VoiceUserId; stream: MediaStream };
  "participant-left": { userId: VoiceUserId };
  "connection-state": { userId: VoiceUserId; state: RTCPeerConnectionState };
  error: { userId?: VoiceUserId; error: Error };
};

type EventKey = keyof RTCManagerEventMap;

type Listener<T extends EventKey> = (payload: RTCManagerEventMap[T]) => void;

type RTCManagerOptions = {
  socket: Socket;
  iceServers?: RTCIceServer[];
  mediaConstraints?: MediaStreamConstraints;
};

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true },
  video: false,
};

export class RTCManager {
  private readonly socket: Socket;
  private readonly iceServers: RTCIceServer[];
  private readonly mediaConstraints: MediaStreamConstraints;
  private readonly listeners = new Map<EventKey, Set<Listener<EventKey>>>();
  private readonly peers = new Map<VoiceUserId, RTCPeerConnection>();
  private readonly remoteStreams = new Map<VoiceUserId, MediaStream>();
  private roomId: string | null = null;
  private userId: VoiceUserId | null = null;
  private localStream: MediaStream | null = null;
  private isMuted = false;

  constructor(options: RTCManagerOptions) {
    this.socket = options.socket;
    this.iceServers = options.iceServers?.length ? options.iceServers : DEFAULT_ICE_SERVERS;
    this.mediaConstraints = options.mediaConstraints ?? DEFAULT_MEDIA_CONSTRAINTS;
    this.registerSocketEvents();
  }

  on<T extends EventKey>(event: T, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener<EventKey>);
    return () => {
      set.delete(listener as Listener<EventKey>);
    };
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(userId: VoiceUserId): MediaStream | null {
    return this.remoteStreams.get(userId) ?? null;
  }

  isLocalMuted(): boolean {
    return this.isMuted;
  }

  async toggleMute(muted: boolean): Promise<void> {
    this.isMuted = muted;
    const stream = this.localStream;
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  async joinRoom(payload: VoiceJoinPayload): Promise<void> {
    this.roomId = payload.roomId;
    this.userId = payload.userId;
    await this.ensureLocalStream();
    this.socket.emit("voice:join", payload);
  }

  leaveRoom(payload?: Partial<VoiceLeavePayload>): void {
    if (!this.roomId || !this.userId) return;
    const roomId = payload?.roomId ?? this.roomId;
    const userId = payload?.userId ?? this.userId;
    this.socket.emit("voice:leave", { roomId, userId } satisfies VoiceLeavePayload);
    this.cleanupPeers();
    this.roomId = null;
    this.userId = null;
  }

  dispose(): void {
    this.leaveRoom();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.listeners.clear();
    this.socket.off("voice:participants");
    this.socket.off("voice:userJoined");
    this.socket.off("voice:userLeft");
    this.socket.off("voice:offer");
    this.socket.off("voice:answer");
    this.socket.off("voice:iceCandidate");
  }

  private async ensureLocalStream(): Promise<void> {
    if (this.localStream) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      throw new Error("Media devices are not available in this environment.");
    }
    this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
    this.emit("local-stream", this.localStream);
  }

  private registerSocketEvents(): void {
    this.socket.on("voice:participants", (data: VoiceParticipantsPayload) => {
      if (!this.roomId || data.roomId !== this.roomId) return;
      data.participants.forEach((participantId) => {
        if (!this.userId || participantId === this.userId) return;
        const peer = this.ensurePeer(participantId);
        this.createOffer(participantId, peer).catch((error) => this.emitError(participantId, error));
      });
    });

    this.socket.on("voice:userJoined", (data: VoiceUserJoinedPayload) => {
      if (!this.roomId || data.roomId !== this.roomId) return;
      if (!this.userId || data.userId === this.userId) return;
      const peer = this.ensurePeer(data.userId);
      this.createOffer(data.userId, peer).catch((error) => this.emitError(data.userId, error));
    });

    this.socket.on("voice:userLeft", (data: VoiceUserLeftPayload) => {
      if (!this.roomId || data.roomId !== this.roomId) return;
      this.removePeer(data.userId);
      this.emit("participant-left", { userId: data.userId });
    });

    this.socket.on("voice:offer", async (data: VoiceOfferReceivedPayload) => {
      if (!this.roomId || data.roomId !== this.roomId) return;
      if (!this.userId || data.fromUserId === this.userId) return;
      const peer = this.ensurePeer(data.fromUserId);
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
        await this.createAnswer(data.fromUserId, peer);
      } catch (error) {
        this.emitError(data.fromUserId, error);
      }
    });

    this.socket.on("voice:answer", async (data: VoiceAnswerReceivedPayload) => {
      if (!this.roomId || data.roomId !== this.roomId) return;
      const peer = this.peers.get(data.fromUserId);
      if (!peer) return;
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        this.emitError(data.fromUserId, error);
      }
    });

    this.socket.on("voice:iceCandidate", async (data: VoiceIceCandidateReceivedPayload) => {
      if (!this.roomId || data.roomId !== this.roomId) return;
      const peer = this.peers.get(data.fromUserId);
      if (!peer) return;
      try {
        await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        this.emitError(data.fromUserId, error);
      }
    });
  }

  private ensurePeer(userId: VoiceUserId): RTCPeerConnection {
    let peer = this.peers.get(userId);
    if (peer) return peer;
    if (typeof RTCPeerConnection === "undefined") {
      throw new Error("RTCPeerConnection is not available in this environment.");
    }
    peer = new RTCPeerConnection({ iceServers: this.iceServers });
    this.peers.set(userId, peer);
    this.attachPeerEvents(userId, peer);
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => peer!.addTrack(track, this.localStream!));
    }
    return peer;
  }

  private attachPeerEvents(userId: VoiceUserId, peer: RTCPeerConnection) {
    peer.onicecandidate = (event) => {
      if (!event.candidate || !this.roomId) return;
      const payload: VoiceIceCandidatePayload = {
        roomId: this.roomId,
        targetUserId: userId,
        candidate: event.candidate.toJSON(),
      };
      this.socket.emit("voice:iceCandidate", payload);
    };

    peer.ontrack = (event) => {
      if (!event.streams.length) return;
      const [stream] = event.streams;
      this.remoteStreams.set(userId, stream);
      this.emit("remote-track", { userId, stream });
    };

    peer.onconnectionstatechange = () => {
      this.emit("connection-state", { userId, state: peer.connectionState });
      if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
        this.removePeer(userId);
        this.emit("participant-left", { userId });
      }
    };
  }

  private async createOffer(userId: VoiceUserId, peer: RTCPeerConnection) {
    if (!this.roomId || !this.userId) return;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload: VoiceOfferPayload = {
      roomId: this.roomId,
      targetUserId: userId,
      offer,
    };
    this.socket.emit("voice:offer", payload);
  }

  private async createAnswer(userId: VoiceUserId, peer: RTCPeerConnection) {
    if (!this.roomId || !this.userId) return;
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload: VoiceAnswerPayload = {
      roomId: this.roomId,
      targetUserId: userId,
      answer,
    };
    this.socket.emit("voice:answer", payload);
  }

  private removePeer(userId: VoiceUserId) {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.getSenders().forEach((sender) => {
        try {
          peer.removeTrack(sender);
        } catch {
          // ignore
        }
      });
      peer.close();
    }
    this.peers.delete(userId);
    this.remoteStreams.delete(userId);
  }

  private cleanupPeers() {
    for (const userId of this.peers.keys()) {
      this.removePeer(userId);
    }
  }

  private emit<T extends EventKey>(event: T, payload: RTCManagerEventMap[T]) {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    listeners.forEach((listener) => {
      listener(payload as RTCManagerEventMap[T]);
    });
  }

  private emitError(userId: VoiceUserId | undefined, err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    this.emit("error", { userId, error });
  }
}

export function createRTCManager(options: RTCManagerOptions): RTCManager {
  return new RTCManager(options);
}

