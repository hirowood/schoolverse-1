/**
 * @file rtc.ts
 * @description WebRTC関連の型定義
 * @author Schoolverse Team
 * @created 2025-10-24
 */

// ============================================
// WebRTC 標準型のエクスポート
// ============================================

/**
 * RTCセッション記述
 */
export type RTCSessionDescriptionInit = {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
};

/**
 * ICE候補
 */
export type RTCIceCandidateInit = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

/**
 * RTC接続状態
 */
export type RTCConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

/**
 * ICE接続状態
 */
export type RTCIceConnectionState =
  | 'new'
  | 'checking'
  | 'connected'
  | 'completed'
  | 'failed'
  | 'disconnected'
  | 'closed';

/**
 * ICE収集状態
 */
export type RTCIceGatheringState = 'new' | 'gathering' | 'complete';

// ============================================
// Schoolverse カスタム型
// ============================================

/**
 * WebRTC接続情報
 */
export interface RTCConnectionInfo {
  /** 接続ID */
  connectionId: string;
  /** 相手のユーザーID */
  remoteUserId: string;
  /** 接続状態 */
  connectionState: RTCConnectionState;
  /** ICE接続状態 */
  iceConnectionState: RTCIceConnectionState;
  /** ICE収集状態 */
  iceGatheringState: RTCIceGatheringState;
  /** 音声トラックの有無 */
  hasAudioTrack: boolean;
  /** ビデオトラックの有無 */
  hasVideoTrack: boolean;
  /** 接続開始時刻 */
  connectedAt?: Date;
}

/**
 * メディアストリーム設定
 */
export interface MediaStreamConstraints {
  /** 音声設定 */
  audio?: boolean | MediaTrackConstraints;
  /** ビデオ設定 */
  video?: boolean | MediaTrackConstraints;
}

/**
 * 音声トラック設定
 */
export interface MediaTrackConstraints {
  /** エコーキャンセリング */
  echoCancellation?: boolean;
  /** ノイズ抑制 */
  noiseSuppression?: boolean;
  /** 自動ゲイン制御 */
  autoGainControl?: boolean;
  /** サンプルレート */
  sampleRate?: number;
  /** サンプルサイズ */
  sampleSize?: number;
}

/**
 * WebRTCピア接続
 */
export interface PeerConnection {
  /** ピアID */
  peerId: string;
  /** RTCPeerConnection */
  connection: RTCPeerConnection;
  /** ローカルストリーム */
  localStream?: MediaStream;
  /** リモートストリーム */
  remoteStream?: MediaStream;
  /** 接続情報 */
  info: RTCConnectionInfo;
}

// ============================================
// Voice Chat 型定義
// ============================================

/**
 * ボイスチャットのユーザーID
 */
export type VoiceUserId = string;

/**
 * Room参加ペイロード
 */
export type VoiceJoinPayload = {
  roomId: string;
  userId: VoiceUserId;
  displayName?: string | null;
};

/**
 * Room退出ペイロード
 */
export type VoiceLeavePayload = {
  roomId: string;
  userId: VoiceUserId;
};

/**
 * Offerペイロード
 */
export type VoiceOfferPayload = {
  roomId: string;
  targetUserId: VoiceUserId;
  offer: RTCSessionDescriptionInit;
};

/**
 * Offer受信ペイロード
 */
export type VoiceOfferReceivedPayload = {
  roomId: string;
  fromUserId: VoiceUserId;
  offer: RTCSessionDescriptionInit;
};

/**
 * Answerペイロード
 */
export type VoiceAnswerPayload = {
  roomId: string;
  targetUserId: VoiceUserId;
  answer: RTCSessionDescriptionInit;
};

/**
 * Answer受信ペイロード
 */
export type VoiceAnswerReceivedPayload = {
  roomId: string;
  fromUserId: VoiceUserId;
  answer: RTCSessionDescriptionInit;
};

/**
 * ICE候補ペイロード
 */
export type VoiceIceCandidatePayload = {
  roomId: string;
  targetUserId: VoiceUserId;
  candidate: RTCIceCandidateInit;
};

/**
 * ICE候補受信ペイロード
 */
export type VoiceIceCandidateReceivedPayload = {
  roomId: string;
  fromUserId: VoiceUserId;
  candidate: RTCIceCandidateInit;
};

/**
 * 参加者リストペイロード
 */
export type VoiceParticipantsPayload = {
  roomId: string;
  participants: VoiceUserId[];
};

/**
 * ユーザー参加ペイロード
 */
export type VoiceUserJoinedPayload = {
  roomId: string;
  userId: VoiceUserId;
  displayName?: string | null;
};

/**
 * ユーザー退出ペイロード
 */
export type VoiceUserLeftPayload = {
  roomId: string;
  userId: VoiceUserId;
};
