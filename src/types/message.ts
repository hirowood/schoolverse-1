export type MessageType = 'TEXT' | 'SYSTEM' | 'NOTIFICATION';

export type Message = {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  roomId: string;
  isPrivate?: boolean;
  recipientId?: string | null;
  createdAt: string | number | Date;
};
