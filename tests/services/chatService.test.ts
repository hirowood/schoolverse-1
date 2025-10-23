import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from '@/services/chatService';

const prismaMock = vi.hoisted(() => ({
  roomMember: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  message: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}));

// eslint-disable-next-line import/first
import { chatService } from '@/services/chatService';

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: overrides.id ?? 'message-1',
  roomId: overrides.roomId ?? 'room-1',
  senderId: overrides.senderId ?? 'user-1',
  content: overrides.content ?? 'Hello world',
  type: overrides.type ?? 'TEXT',
  recipientId: overrides.recipientId ?? null,
  createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
  sender:
    overrides.sender ?? ({
      id: 'user-1',
      displayName: 'Test User',
      avatarUrl: null,
    } as ChatMessage['sender']),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('chatService', () => {
  describe('listRoomsForUser', () => {
    it('returns an empty array when the user has no memberships', async () => {
      prismaMock.roomMember.findMany.mockResolvedValue([]);

      const result = await chatService.listRoomsForUser('user-123');

      expect(result).toEqual([]);
      expect(prismaMock.roomMember.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { room: true },
      });
    });

    it('sorts rooms by most recent message and maps the payload', async () => {
      prismaMock.roomMember.findMany.mockResolvedValue([
        { roomId: 'room-1', room: { id: 'room-1', name: 'General' } },
        { roomId: 'room-2', room: { id: 'room-2', name: 'Project' } },
      ]);

      const newerMessage = makeMessage({
        id: 'message-2',
        roomId: 'room-2',
        content: 'Latest update',
        createdAt: new Date('2024-02-01T10:00:00Z'),
        sender: { id: 'user-2', displayName: 'Bob', avatarUrl: null },
      });

      const olderMessage = makeMessage({
        id: 'message-1',
        roomId: 'room-1',
        content: 'Earlier message',
        createdAt: new Date('2024-01-15T09:00:00Z'),
        sender: { id: 'user-3', displayName: 'Carol', avatarUrl: null },
      });

      prismaMock.message.findMany.mockImplementation(async ({ where: { roomId } }) => {
        if (roomId === 'room-1') {
          return [olderMessage];
        }
        if (roomId === 'room-2') {
          return [newerMessage];
        }
        return [];
      });

      const result = await chatService.listRoomsForUser('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'room-2',
        name: 'Project',
        lastMessage: newerMessage,
        unreadCount: 0,
      });
      expect(result[1]).toMatchObject({
        id: 'room-1',
        name: 'General',
        lastMessage: olderMessage,
        unreadCount: 0,
      });
    });
  });

  describe('getRoomHistory', () => {
    it('throws when the user is not a room member', async () => {
      prismaMock.roomMember.findUnique.mockResolvedValue(null);

      await expect(
        chatService.getRoomHistory({ roomId: 'room-1', userId: 'user-1' }),
      ).rejects.toThrowError('ROOM_FORBIDDEN');
    });

    it('returns paginated messages in chronological order', async () => {
      prismaMock.roomMember.findUnique.mockResolvedValue({ roomId: 'room-1', userId: 'user-1' });

      const third = makeMessage({
        id: 'message-3',
        createdAt: new Date('2024-02-03T12:00:00Z'),
      });
      const second = makeMessage({
        id: 'message-2',
        createdAt: new Date('2024-02-02T12:00:00Z'),
      });
      const first = makeMessage({
        id: 'message-1',
        createdAt: new Date('2024-02-01T12:00:00Z'),
      });

      prismaMock.message.findMany.mockResolvedValue([third, second, first]);

      const result = await chatService.getRoomHistory({
        roomId: 'room-1',
        userId: 'user-1',
        limit: 3,
      });

      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roomId: 'room-1' },
          take: 4,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result.items.map((item) => item.id)).toEqual(['message-1', 'message-2', 'message-3']);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('persists a message after membership validation', async () => {
      prismaMock.roomMember.findUnique.mockResolvedValue({ roomId: 'room-1', userId: 'user-1' });
      const created = makeMessage({
        id: 'message-123',
        content: 'Persisted!',
        createdAt: new Date('2024-03-01T08:30:00Z'),
      });
      prismaMock.message.create.mockResolvedValue(created);

      const result = await chatService.sendMessage({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Persisted!',
      });

      expect(prismaMock.roomMember.findUnique).toHaveBeenCalledWith({
        where: { userId_roomId: { userId: 'user-1', roomId: 'room-1' } },
      });
      expect(prismaMock.message.create).toHaveBeenCalledWith({
        data: {
          roomId: 'room-1',
          senderId: 'user-1',
          content: 'Persisted!',
          type: 'TEXT',
          recipientId: null,
        },
        include: {
          sender: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });
      expect(result).toEqual(created);
    });
  });
});
