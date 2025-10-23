import { prisma } from '@/lib/db/prisma';

type RoomSummary = {
  id: string;
  name: string;
  unreadCount: number;
  lastMessage: ChatMessage | null;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'NOTIFICATION';
  recipientId: string | null;
  createdAt: Date;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export type PaginatedMessages = {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type SendMessagePayload = {
  roomId: string;
  senderId: string;
  content: string;
  type?: 'TEXT' | 'SYSTEM' | 'NOTIFICATION';
  recipientId?: string | null;
};

class ChatService {
  private async ensureMembership(roomId: string, userId: string) {
    const membership = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!membership) {
      throw new Error('ROOM_FORBIDDEN');
    }
  }

  async listRoomsForUser(userId: string): Promise<RoomSummary[]> {
    const memberships = await prisma.roomMember.findMany({
      where: { userId },
      include: {
        room: true,
      },
    });

    if (memberships.length === 0) {
      return [];
    }

    const summaries = await Promise.all(
      memberships.map(async ({ roomId, room }) => {
        const [lastMessage] = await prisma.message.findMany({
          where: { roomId },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        });

        // TODO: introduce read receipts to compute actual unread counts.
        const unreadCount = 0;

        return {
          id: roomId,
          name: room.name,
          unreadCount,
          lastMessage: lastMessage ? this.toChatMessage(lastMessage) : null,
        };
      }),
    );

    return summaries.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt.getTime() ?? 0;
      const bTime = b.lastMessage?.createdAt.getTime() ?? 0;
      return bTime - aTime;
    });
  }

  async getRoomHistory(params: {
    roomId: string;
    userId: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedMessages> {
    const { roomId, userId, cursor, limit = 50 } = params;
    await this.ensureMembership(roomId, userId);

    const take = Math.min(Math.max(limit, 1), 100);

    const records = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: {
        sender: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    const hasMore = records.length > take;
    const slice = hasMore ? records.slice(0, -1) : records;
    const ordered = slice.map((m) => this.toChatMessage(m)).reverse();

    return {
      items: ordered,
      nextCursor: hasMore ? records[records.length - 2]?.id ?? null : null,
      hasMore,
    };
  }

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const { roomId, senderId, content, type = 'TEXT', recipientId = null } = payload;
    await this.ensureMembership(roomId, senderId);

    const message = await prisma.message.create({
      data: {
        roomId,
        senderId,
        content,
        type,
        recipientId,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    // TODO: emit chat:message:new via socket gateway once integrated.

    return this.toChatMessage(message);
  }

  private toChatMessage(message: {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    type: 'TEXT' | 'SYSTEM' | 'NOTIFICATION';
    recipientId: string | null;
    createdAt: Date;
    sender: { id: string; displayName: string | null; avatarUrl: string | null };
  }): ChatMessage {
    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      recipientId: message.recipientId,
      createdAt: message.createdAt,
      sender: message.sender,
    };
  }
}

export const chatService = new ChatService();
