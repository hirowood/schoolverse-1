export type SocketEvent =
  | 'connect'
  | 'disconnect'
  | 'message:send'
  | 'message:receive'
  | 'room:join'
  | 'room:leave'
  | 'space:position:update';
