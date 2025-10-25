/**
 * EduVerse Phase 2: VoiceStore (改善版)
 * 
 * ビデオ会議の状態管理
 * ✅ MediasoupClient の統合
 * ✅ 参加者管理
 * ✅ カメラ/画面共有の制御
 */

import { create } from 'zustand';
import type { MediasoupClient } from '@/lib/rtc/mediasoupClient';
import type { Participant } from '@/types/mediasoup';

type VoiceState = {
  // ━━━ 状態 ━━━
  muted: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
  participants: Map<string, Participant>;
  client: MediasoupClient | null;
  isJoined: boolean;
  localStream: MediaStream | null;

  // ━━━ アクション ━━━
  setClient: (client: MediasoupClient | null) => void;
  setMuted: (v: boolean) => void;
  toggleCamera: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  joinRoom: (roomId: string, userId: string, audioStream: MediaStream) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateParticipant: (userId: string, updates: Partial<Participant>) => void;
  removeParticipant: (userId: string) => void;
  setLocalStream: (stream: MediaStream | null) => void;
};

/**
 * ✅ VoiceStore
 * 
 * ビデオ会議の状態管理
 */
export const useVoiceStore = create<VoiceState>((set, get) => ({
  // ━━━ 初期値 ━━━
  muted: true,
  cameraEnabled: false,
  screenShareEnabled: false,
  participants: new Map(),
  client: null,
  isJoined: false,
  localStream: null,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // アクション実装
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  setClient: (client) => set({ client }),

  setMuted: (v) => {
    const { localStream } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !v;
      });
    }
    set({ muted: v });
  },

  toggleCamera: async () => {
    const { client, cameraEnabled } = get();
    if (!client) {
      console.error('[VoiceStore] Client not initialized');
      return;
    }

    try {
      if (cameraEnabled) {
        await client.disableCamera();
        set({ cameraEnabled: false });
      } else {
        await client.enableCamera();
        set({ cameraEnabled: true });
      }
    } catch (error) {
      console.error('[VoiceStore] Toggle camera failed:', error);
    }
  },

  startScreenShare: async () => {
    const { client } = get();
    if (!client) {
      console.error('[VoiceStore] Client not initialized');
      return;
    }

    try {
      await client.startScreenShare();
      set({ screenShareEnabled: true });
    } catch (error) {
      console.error('[VoiceStore] Start screen share failed:', error);
    }
  },

  stopScreenShare: async () => {
    const { client } = get();
    if (!client) {
      console.error('[VoiceStore] Client not initialized');
      return;
    }

    try {
      await client.stopScreenShare();
      set({ screenShareEnabled: false });
    } catch (error) {
      console.error('[VoiceStore] Stop screen share failed:', error);
    }
  },

  joinRoom: async (roomId, userId, audioStream) => {
    const { client } = get();
    if (!client) {
      console.error('[VoiceStore] Client not initialized');
      return;
    }

    try {
      await client.joinRoom({ roomId, userId, audioStream });
      set({ isJoined: true, localStream: audioStream });

      // ━━━ リモートトラックのイベントリスナー ━━━
      client.on('remote-track', ({ userId: remoteUserId, stream, kind }) => {
        const { participants } = get();
        const existing = participants.get(remoteUserId);

        const updated: Participant = existing || {
          userId: remoteUserId,
          audioStream: null,
          videoStream: null,
          screenStream: null,
          isMuted: false,
          isCameraOff: false,
          isSpeaking: false,
        };

        if (kind === 'audio') updated.audioStream = stream;
        if (kind === 'video') updated.videoStream = stream;
        if (kind === 'screen') updated.screenStream = stream;

        participants.set(remoteUserId, updated);
        set({ participants: new Map(participants) });

        console.log(`[VoiceStore] Received ${kind} from ${remoteUserId}`);
      });

      // ━━━ Producer クローズのイベントリスナー ━━━
      client.on('producer-closed', ({ userId: remoteUserId }) => {
        if (!remoteUserId) return;
        const { participants } = get();
        participants.delete(remoteUserId);
        set({ participants: new Map(participants) });

        console.log(`[VoiceStore] User ${remoteUserId} stopped producing`);
      });

      console.log('[VoiceStore] Joined room:', roomId);
    } catch (error) {
      console.error('[VoiceStore] Join room failed:', error);
    }
  },

  leaveRoom: async () => {
    const { client, localStream } = get();
    if (!client) return;

    try {
      await client.leaveRoom();

      // ローカルストリームのトラックを停止
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      set({
        isJoined: false,
        participants: new Map(),
        cameraEnabled: false,
        screenShareEnabled: false,
        localStream: null,
      });

      console.log('[VoiceStore] Left room');
    } catch (error) {
      console.error('[VoiceStore] Leave room failed:', error);
    }
  },

  updateParticipant: (userId, updates) => {
    const { participants } = get();
    const existing = participants.get(userId);
    if (!existing) return;

    participants.set(userId, { ...existing, ...updates });
    set({ participants: new Map(participants) });
  },

  removeParticipant: (userId) => {
    const { participants } = get();
    participants.delete(userId);
    set({ participants: new Map(participants) });
  },

  setLocalStream: (stream) => set({ localStream: stream }),
}));
