/**
 * EduVerse Phase 2: mediasoup 型定義
 * 
 * mediasoup を使ったビデオ会議機能の共通型定義
 * すべてのモジュールでこの型を使用することで、インターフェース不一致を防ぐ
 */

import type {
  RtpCapabilities as MediasoupRtpCapabilities,
  IceParameters,
  IceCandidate,
  DtlsParameters,
  RtpParameters,
} from 'mediasoup-client/lib/types';

/**
 * メディアの種類
 * - audio: 音声
 * - video: カメラ映像
 * - screen: 画面共有
 */
export type MediaKind = 'audio' | 'video' | 'screen';

/**
 * RTP Capabilities (mediasoup-client から)
 */
export type RtpCapabilities = MediasoupRtpCapabilities;

/**
 * Room 参加時のペイロード
 */
export type MediasoupJoinPayload = {
  roomId: string;
  userId: string;
  rtpCapabilities: RtpCapabilities;
};

/**
 * Room 参加レスポンス
 */
export type MediasoupJoinResponse = {
  roomId: string;
  routerRtpCapabilities: RtpCapabilities;
  error?: string;
};

/**
 * Transport 情報
 */
export type TransportInfo = {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
  error?: string;
};

/**
 * Producer 情報
 */
export type ProducerInfo = {
  userId: string;
  producerId: string;
  kind: MediaKind;
};

/**
 * Produce リクエスト
 */
export type ProduceRequest = {
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
};

/**
 * Produce レスポンス
 */
export type ProduceResponse = {
  id?: string;
  error?: string;
};

/**
 * Consume リクエスト
 */
export type ConsumeRequest = {
  transportId: string;
  producerId: string;
  rtpCapabilities: RtpCapabilities;
};

/**
 * Consume レスポンス
 */
export type ConsumeResponse = {
  id?: string;
  kind?: MediaKind;
  rtpParameters?: RtpParameters;
  error?: string;
};

/**
 * 参加者情報
 */
export type Participant = {
  userId: string;
  displayName?: string;
  audioStream: MediaStream | null;
  videoStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeaking: boolean;
};

/**
 * エラーレスポンス
 */
export type ErrorResponse = {
  error: string;
};
