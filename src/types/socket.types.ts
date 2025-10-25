/**
 * @file socket.types.ts
 * @description Socket.ioイベントの型定義
 * @author Schoolverse Team
 * @created 2025-10-24
 */

import type { RTCSessionDescriptionInit, RTCIceCandidateInit } from '@/types/rtc';

// ============================================
// クライアント → サーバー イベント
// ============================================

/**
 * クライアントがサーバーに送信するイベントの型定義
 */
export interface ClientToServerEvents {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // プレゼンス（存在確認）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'presence:join': (payload: PresenceJoinPayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 空間（3D仮想空間）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'space:position:update': (payload: PositionUpdatePayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // チャット
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'chat:join': (payload: ChatJoinPayload) => void;
  'chat:leave': (payload: ChatLeavePayload) => void;
  'chat:typing': (payload: ChatTypingPayload) => void;
  'chat:message:new': (payload: ChatMessageNewPayload) => void;
  'chat:receipt:update': (payload: ChatReceiptUpdatePayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 音声通話（WebRTC）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'voice:join': (payload: VoiceJoinPayload) => void;
  'voice:leave': (payload: VoiceLeavePayload) => void;
  'voice:offer': (payload: VoiceOfferPayload) => void;
  'voice:answer': (payload: VoiceAnswerPayload) => void;
  'voice:iceCandidate': (payload: VoiceIceCandidatePayload) => void;
}

// ============================================
// サーバー → クライアント イベント
// ============================================

/**
 * サーバーがクライアントに送信するイベントの型定義
 */
export interface ServerToClientEvents {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // プレゼンス
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'presence:state': (payload: PresenceStatePayload) => void;
  'presence:joined': (payload: PresenceJoinedPayload) => void;
  'presence:left': (payload: PresenceLeftPayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 空間
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'space:position:update': (payload: PositionUpdateBroadcastPayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // チャット
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'chat:room:joined': (payload: ChatRoomJoinedPayload) => void;
  'chat:typing': (payload: ChatTypingBroadcastPayload) => void;
  'chat:message:new': (payload: unknown) => void;
  'chat:receipt:update': (payload: ChatReceiptBroadcastPayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 音声通話
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'voice:participants': (payload: VoiceParticipantsPayload) => void;
  'voice:userJoined': (payload: VoiceUserJoinedPayload) => void;
  'voice:userLeft': (payload: VoiceUserLeftPayload) => void;
  'voice:offer': (payload: VoiceOfferReceivedPayload) => void;
  'voice:answer': (payload: VoiceAnswerReceivedPayload) => void;
  'voice:iceCandidate': (payload: VoiceIceCandidateReceivedPayload) => void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // エラー・システム
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'error': (payload: ErrorPayload) => void;
}

// ============================================
// ペイロード型定義
// ============================================

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// プレゼンス関連
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PresenceJoinPayload {
  userId: string;
  displayName?: string;
}

export interface PresenceStatePayload {
  userId: string;
  x: number;
  y: number;
  displayName?: string;
}

export interface PresenceJoinedPayload {
  userId: string;
  x: number;
  y: number;
  displayName?: string;
}

export interface PresenceLeftPayload {
  userId: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 空間（位置同期）関連
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PositionUpdatePayload {
  x: number;
  y: number;
}

export interface PositionUpdateBroadcastPayload {
  userId: string;
  x: number;
  y: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// チャット関連
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ChatJoinPayload {
  roomId: string;
  userId: string;
}

export interface ChatLeavePayload {
  roomId: string;
  userId: string;
}

export interface ChatRoomJoinedPayload {
  roomId: string;
}

export interface ChatTypingPayload {
  roomId: string;
  userId: string;
  state: 'started' | 'stopped';
}

export interface ChatTypingBroadcastPayload {
  roomId: string;
  userId: string;
  state: 'started' | 'stopped';
}

export interface ChatMessageNewPayload {
  roomId: string;
  userId: string;
  message: unknown;
}

export interface ChatReceiptUpdatePayload {
  roomId: string;
  userId: string;
  messageId: string;
  status: string;
}

export interface ChatReceiptBroadcastPayload {
  roomId: string;
  messageId: string;
  userId: string;
  status: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 音声通話関連
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VoiceJoinPayload {
  roomId: string;
  userId: string;
  displayName?: string | null;
}

export interface VoiceLeavePayload {
  roomId: string;
  userId: string;
}

export interface VoiceParticipantsPayload {
  roomId: string;
  participants: string[];
}

export interface VoiceUserJoinedPayload {
  roomId: string;
  userId: string;
  displayName?: string | null;
}

export interface VoiceUserLeftPayload {
  roomId: string;
  userId: string;
}

export interface VoiceOfferPayload {
  roomId: string;
  targetUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface VoiceOfferReceivedPayload {
  roomId: string;
  fromUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface VoiceAnswerPayload {
  roomId: string;
  targetUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface VoiceAnswerReceivedPayload {
  roomId: string;
  fromUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface VoiceIceCandidatePayload {
  roomId: string;
  targetUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface VoiceIceCandidateReceivedPayload {
  roomId: string;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// エラー関連
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================
// Socket接続状態
// ============================================

export type SocketConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Socket接続情報
 */
export interface SocketConnectionInfo {
  state: SocketConnectionState;
  socketId: string | null;
  reconnectAttempts: number;
  lastError: string | null;
}
