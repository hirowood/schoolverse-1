import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import type { ChatMessage, RoomSummary } from '@/store/chatStore';
import { mswServer } from '../setup/mswServer';

type Listener = (payload: any) => void;

const createMockSocket = () => {
  const listeners = new Map<string, Set<Listener>>();
  const emitLog: Array<{ event: string; payload: unknown }> = [];

  const socket = {
    on(event: string, handler: Listener) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
      return socket;
    },
    off(event: string, handler: Listener) {
      listeners.get(event)?.delete(handler);
      return socket;
    },
    emit: vi.fn((event: string, payload: unknown) => {
      emitLog.push({ event, payload });
      listeners.get(event)?.forEach((handler) => handler(payload));
      return true;
    }),
  };

  return {
    socket,
    helpers: {
      emitLog,
      trigger(event: string, payload: unknown) {
        listeners.get(event)?.forEach((handler) => handler(payload));
      },
      clear() {
        emitLog.length = 0;
        listeners.clear();
      },
    },
  };
};

const defaultUser = {
  id: 'user-1',
  displayName: 'Alice Example',
  avatarUrl: null,
};

async function setupChatStore(options: { user?: typeof defaultUser } = {}) {
  vi.resetModules();

  const { socket, helpers } = createMockSocket();

  vi.doMock('@/lib/socket/socketClient', () => ({
    getSocket: () => socket,
  }));


  const { useChatStore } = await import('@/store/chatStore');

  return {
    useChatStore,
    socketHelpers: helpers,
    // No authStore dependency anymore; chatStore accepts currentUser via params
  };
}

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: overrides.id ?? 'message-1',
  roomId: overrides.roomId ?? 'room-1',
  senderId: overrides.senderId ?? 'user-1',
  content: overrides.content ?? 'Hello from history',
  type: overrides.type ?? 'TEXT',
  recipientId: overrides.recipientId ?? null,
  createdAt: overrides.createdAt ?? new Date('2024-02-01T10:00:00Z').toISOString(),
  sender: overrides.sender ?? {
    id: overrides.senderId ?? 'user-1',
    displayName: 'Alice Example',
    avatarUrl: null,
  },
  receipts: overrides.receipts,
});

const makeRoom = (overrides: Partial<RoomSummary> = {}): RoomSummary => ({
  id: overrides.id ?? 'room-1',
  name: overrides.name ?? 'General',
  unreadCount: overrides.unreadCount ?? 0,
  lastMessage: overrides.lastMessage ?? null,
});

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('chatStore', () => {
  it('connectSocket wires listeners that hydrate incoming messages', async () => {
    const { useChatStore, socketHelpers } = await setupChatStore();

    useChatStore.getState().connectSocket();

    const inbound = makeMessage({ id: 'incoming-1', content: 'Server pushed' });
    socketHelpers.trigger('chat:message:new', inbound);

    const state = useChatStore.getState();
    expect(state.messages[inbound.roomId]).toBeDefined();
    expect(state.messages[inbound.roomId]).toHaveLength(1);
    expect(state.messages[inbound.roomId]?.[0]).toMatchObject({ id: 'incoming-1', content: 'Server pushed' });
  });

  it('loadRooms stores server payload and resets errors', async () => {
    const rooms = [
      makeRoom({ id: 'room-1', name: 'General' }),
      makeRoom({ id: 'room-2', name: 'Support', unreadCount: 4 }),
    ];

    mswServer.use(
      http.get('/api/chat/rooms', () => HttpResponse.json({ rooms })),
    );

    const { useChatStore } = await setupChatStore();

    await useChatStore.getState().loadRooms();

    const state = useChatStore.getState();
    expect(state.rooms).toEqual(rooms);
    expect(state.roomsStatus).toBe('idle');
    expect(state.roomsError).toBeUndefined();
  });

  it('loadRooms captures error state when request fails', async () => {
    mswServer.use(
      http.get('/api/chat/rooms', () => HttpResponse.json({ error: 'ROOMS_FETCH_FAILED' }, { status: 500 })),
    );

    const { useChatStore } = await setupChatStore();

    await useChatStore.getState().loadRooms();

    const state = useChatStore.getState();
    expect(state.roomsStatus).toBe('error');
    expect(state.roomsError).toBe('ROOMS_FETCH_FAILED');
  });

  it('loadInitialMessages hydrates history and cursor', async () => {
    const history = [makeMessage({ id: 'history-1' }), makeMessage({ id: 'history-2' })];

    mswServer.use(
      http.get('/api/chat/rooms/room-1/messages', () =>
        HttpResponse.json({
          items: history,
          nextCursor: 'cursor-123',
          hasMore: true,
        }),
      ),
    );

    const { useChatStore } = await setupChatStore();

    await useChatStore.getState().loadInitialMessages('room-1');

    const state = useChatStore.getState();
    expect(state.messages['room-1']).toEqual(history);
    expect(state.messageCursors['room-1']).toBe('cursor-123');
    expect(state.messageStatus['room-1']).toBe('idle');
  });

  it('sendMessage posts payload, replaces optimistic entry, and emits socket event', async () => {
    const persisted = makeMessage({ id: 'message-100', content: 'Persisted message' });

    mswServer.use(
      http.post('/api/chat/rooms/room-1/messages', async ({ request }) => {
        const body = (await request.json()) as { content: string };
        expect(body).toMatchObject({ content: 'Persisted message' });
        return HttpResponse.json({ message: persisted });
      }),
    );

    const { useChatStore, socketHelpers } = await setupChatStore();

    await useChatStore.getState().sendMessage('room-1', { content: 'Persisted message' });

    const state = useChatStore.getState();
    expect(state.messages['room-1']).toHaveLength(1);
    expect(state.messages['room-1']?.[0]).toMatchObject({ id: 'message-100', content: 'Persisted message' });
    expect(socketHelpers.emitLog.some((entry) => entry.event === 'chat:message:new')).toBe(true);
  });

  it('sendMessage rolls back optimistic entry when the request fails', async () => {
    mswServer.use(
      http.post('/api/chat/rooms/room-1/messages', () =>
        HttpResponse.json({ error: 'MESSAGE_SEND_FAILED' }, { status: 500 }),
      ),
    );

    const { useChatStore } = await setupChatStore();

    await useChatStore.getState().sendMessage('room-1', { content: 'Will fail' });

    const state = useChatStore.getState();
    expect(state.messages['room-1']).toBeUndefined();
    expect(state.messageErrors['room-1']).toBe('MESSAGE_SEND_FAILED');
  });

  it('handleTypingEvent expires typing indicators automatically', async () => {
    vi.useFakeTimers();
    const { useChatStore } = await setupChatStore();

    useChatStore.getState().handleTypingEvent('room-1', 'user-2', 'started');
    expect(useChatStore.getState().typing['room-1']).toBeDefined();

    vi.advanceTimersByTime(8300);
    await vi.runOnlyPendingTimersAsync();

    expect(useChatStore.getState().typing['room-1']).toBeUndefined();

    vi.useRealTimers();
  });
});
