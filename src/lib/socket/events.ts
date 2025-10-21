export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  POSITION_UPDATE: 'space:position:update',
} as const;

export type SocketEventKey = keyof typeof SOCKET_EVENTS;
