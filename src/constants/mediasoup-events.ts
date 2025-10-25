/**
 * EduVerse Phase 2: mediasoup Socket.io イベント定数
 * 
 * ✅ 送信側と受信側で完全一致させるため定数化
 * ✅ typo によるバグを防止
 * ✅ イベント名の変更が容易
 */

/**
 * mediasoup 関連のSocket.ioイベント名
 */
export const MEDIASOUP_EVENTS = {
  // ━━━ Client → Server ━━━
  
  /** Room に参加 */
  JOIN: 'voice:join',
  
  /** Transport を作成 */
  CREATE_TRANSPORT: 'voice:createTransport',
  
  /** Transport を接続 */
  CONNECT_TRANSPORT: 'voice:connectTransport',
  
  /** メディアを送信開始 (audio/video/screen) */
  PRODUCE: 'voice:produce',
  
  /** 他ユーザーのメディアを受信開始 */
  CONSUME: 'voice:consume',
  
  // ━━━ Server → Client ━━━
  
  /** 新しいユーザーが参加した */
  USER_JOINED: 'voice:userJoined',
  
  /** ユーザーが退出した */
  USER_LEFT: 'voice:userLeft',
  
  /** 新しい Producer が作成された */
  NEW_PRODUCER: 'voice:newProducer',
  
  /** Producer が閉じられた */
  PRODUCER_CLOSED: 'voice:producerClosed',
} as const;

/**
 * イベント名の型
 */
export type MediasoupEventName = typeof MEDIASOUP_EVENTS[keyof typeof MEDIASOUP_EVENTS];
