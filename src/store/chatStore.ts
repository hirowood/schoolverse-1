"use client";

import { create } from 'zustand';
import { getSocket } from '@/lib/socket/socketClient';
import { useAuthStore } from '@/store/authStore';

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'NOTIFICATION';
  recipientId: string | null;
  createdAt: string;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  receipts?: Array<{
    userId: string;
    status: string;
    updatedAt: string;
  }>;
};

export type RoomSummary = {
  id: string;
  name: string;
  unreadCount: number;
  lastMessage: ChatMessage | null;
};

type TypingState = Record<
  string,
  {
    users: Record<string, number>;
  }
>;

type ChatState = {
  rooms: RoomSummary[];
  roomsStatus: 'idle' | 'loading' | 'error';
  roomsError?: string;
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  messageCursors: Record<string, string | null>;
  messageStatus: Record<string, 'idle' | 'loading' | 'error'>;
  messageErrors: Record<string, string | undefined>;
  typing: TypingState;
};

type ChatActions = {
  connectSocket: () => void;
  loadRooms: () => Promise<void>;
  setActiveRoom: (roomId: string | null) => void;
  loadInitialMessages: (roomId: string) => Promise<void>;
  loadOlderMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, payload: { content: string; type?: 'TEXT' | 'SYSTEM' | 'NOTIFICATION'; recipientId?: string | null }) => Promise<void>;
  upsertMessage: (roomId: string, message: ChatMessage) => void;
  handleTypingEvent: (roomId: string, userId: string, state: 'started' | 'stopped') => void;
  clearTyping: (roomId: string, userId: string) => void;
  notifyTyping: (roomId: string, state: 'started' | 'stopped') => void;
};

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  rooms: [],
  roomsStatus: 'idle',
  activeRoomId: null,
  messages: {},
  messageCursors: {},
  messageStatus: {},
  messageErrors: {},
  typing: {},
};

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

let socketBound = false;

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  connectSocket: () => {
    if (socketBound) return;
    socketBound = true;
    if (typeof window === 'undefined') return;
    const socket = getSocket();

    socket.on('chat:message:new', (message: ChatMessage) => {
      get().upsertMessage(message.roomId, message);
    });

    socket.on('chat:typing', ({ roomId, userId, state }: { roomId: string; userId: string; state: 'started' | 'stopped' }) => {
      get().handleTypingEvent(roomId, userId, state);
    });

    socket.on('chat:receipt:update', ({ roomId, messageId, userId, status }) => {
      const state = get();
      const roomMessages = state.messages[roomId];
      if (!roomMessages) return;
      const updated = roomMessages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              receipts: msg.receipts?.map?.((receipt) =>
                receipt.userId === userId ? { ...receipt, status, updatedAt: new Date().toISOString() } : receipt,
              ) ?? msg.receipts,
            }
          : msg,
      );
      set((prev) => ({
        messages: {
          ...prev.messages,
          [roomId]: updated,
        },
      }));
    });
  },

  loadRooms: async () => {
    set({ roomsStatus: 'loading', roomsError: undefined });
    try {
      const response = await fetch('/api/chat/rooms', { credentials: 'include' });
      if (!response.ok) {
        const data = await parseJson<{ error?: string }>(response);
        set({ roomsStatus: 'error', roomsError: data.error ?? 'ROOMS_FETCH_FAILED' });
        return;
      }
      const data = await parseJson<{ rooms: RoomSummary[] }>(response);
      set({ rooms: data.rooms ?? [], roomsStatus: 'idle', roomsError: undefined });
    } catch (error) {
      console.error('[chatStore] loadRooms error', error);
      set({ roomsStatus: 'error', roomsError: 'ROOMS_FETCH_FAILED' });
    }
  },

  setActiveRoom: (roomId) => {
    const socket = getSocket();
    const authUser = useAuthStore.getState().user;
    set((prev) => {
      if (authUser && prev.activeRoomId && prev.activeRoomId !== roomId) {
        socket.emit('chat:leave', { roomId: prev.activeRoomId, userId: authUser.id });
      }
      return { activeRoomId: roomId };
    });
    if (!roomId || !authUser) return;
    socket.emit('chat:join', { roomId, userId: authUser.id });
  },

  loadInitialMessages: async (roomId) => {
    const state = get();
    if (state.messageStatus[roomId] === 'loading') return;
    set((prev) => ({
      messageStatus: { ...prev.messageStatus, [roomId]: 'loading' },
      messageErrors: { ...prev.messageErrors, [roomId]: undefined },
    }));

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages?limit=50`, { credentials: 'include' });
      if (!response.ok) {
        const data = await parseJson<{ error?: string }>(response);
        set((prev) => ({
          messageStatus: { ...prev.messageStatus, [roomId]: 'error' },
          messageErrors: { ...prev.messageErrors, [roomId]: data.error ?? 'MESSAGES_FETCH_FAILED' },
        }));
        return;
      }
      const data = await parseJson<{ items: ChatMessage[]; nextCursor: string | null; hasMore: boolean }>(response);
      set((prev) => ({
        messages: { ...prev.messages, [roomId]: data.items ?? [] },
        messageCursors: { ...prev.messageCursors, [roomId]: data.nextCursor ?? null },
        messageStatus: { ...prev.messageStatus, [roomId]: 'idle' },
      }));
    } catch (error) {
      console.error('[chatStore] loadInitialMessages error', error);
      set((prev) => ({
        messageStatus: { ...prev.messageStatus, [roomId]: 'error' },
        messageErrors: { ...prev.messageErrors, [roomId]: 'MESSAGES_FETCH_FAILED' },
      }));
    }
  },

  loadOlderMessages: async (roomId) => {
    const { messageCursors, messageStatus } = get();
    const cursor = messageCursors[roomId];
    if (cursor === null || messageStatus[roomId] === 'loading') return;

    set((prev) => ({
      messageStatus: { ...prev.messageStatus, [roomId]: 'loading' },
      messageErrors: { ...prev.messageErrors, [roomId]: undefined },
    }));

    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      const response = await fetch(`/api/chat/rooms/${roomId}/messages?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) {
        const data = await parseJson<{ error?: string }>(response);
        set((prev) => ({
          messageStatus: { ...prev.messageStatus, [roomId]: 'error' },
          messageErrors: { ...prev.messageErrors, [roomId]: data.error ?? 'MESSAGES_FETCH_FAILED' },
        }));
        return;
      }
      const data = await parseJson<{ items: ChatMessage[]; nextCursor: string | null; hasMore: boolean }>(response);
      set((prev) => {
        const existing = prev.messages[roomId] ?? [];
        return {
          messages: { ...prev.messages, [roomId]: [...(data.items ?? []), ...existing] },
          messageCursors: { ...prev.messageCursors, [roomId]: data.nextCursor ?? null },
          messageStatus: { ...prev.messageStatus, [roomId]: 'idle' },
        };
      });
    } catch (error) {
      console.error('[chatStore] loadOlderMessages error', error);
      set((prev) => ({
        messageStatus: { ...prev.messageStatus, [roomId]: 'error' },
        messageErrors: { ...prev.messageErrors, [roomId]: 'MESSAGES_FETCH_FAILED' },
      }));
    }
  },

  sendMessage: async (roomId, payload) => {
    const authUser = useAuthStore.getState().user;
    const optimisticId = `tmp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      roomId,
      senderId: authUser?.id ?? 'self',
      content: payload.content,
      type: payload.type ?? 'TEXT',
      recipientId: payload.recipientId ?? null,
      createdAt: new Date().toISOString(),
      sender: {
        id: authUser?.id ?? 'self',
        displayName: authUser?.displayName ?? 'You',
        avatarUrl: authUser?.avatarUrl ?? null,
      },
      receipts: [],
    };

    set((prev) => ({
      messages: {
        ...prev.messages,
        [roomId]: [...(prev.messages[roomId] ?? []), optimisticMessage],
      },
    }));

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await parseJson<{ error?: string }>(response);
        set((prev) => ({
          messages: {
            ...prev.messages,
            [roomId]: (prev.messages[roomId] ?? []).filter((msg) => msg.id !== optimisticId),
          },
          messageErrors: { ...prev.messageErrors, [roomId]: data.error ?? 'MESSAGE_SEND_FAILED' },
        }));
        return;
      }

      const data = await parseJson<{ message: ChatMessage }>(response);
      get().upsertMessage(roomId, data.message);
     const socket = getSocket();
      socket.emit('chat:message:new', { roomId, userId: data.message.senderId, message: data.message });
    } catch (error) {
      console.error('[chatStore] sendMessage error', error);
      set((prev) => ({
        messages: {
          ...prev.messages,
          [roomId]: (prev.messages[roomId] ?? []).filter((msg) => msg.id !== optimisticId),
        },
        messageErrors: { ...prev.messageErrors, [roomId]: 'MESSAGE_SEND_FAILED' },
      }));
    }
  },

  upsertMessage: (roomId, message) => {
    set((prev) => {
      const existing = prev.messages[roomId] ?? [];
      const filtered = existing.filter((msg) => msg.id !== message.id);
      const next = [...filtered, message].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      return {
        messages: {
          ...prev.messages,
          [roomId]: next,
        },
        rooms: prev.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                lastMessage: message,
              }
            : room,
        ),
      };
    });
  },

  handleTypingEvent: (roomId, userId, state) => {
    if (state === 'started') {
      const expiresAt = Date.now() + 8000;
      set((prev) => ({
        typing: {
          ...prev.typing,
          [roomId]: {
            users: {
              ...(prev.typing[roomId]?.users ?? {}),
              [userId]: expiresAt,
            },
          },
        },
      }));
      setTimeout(() => {
        get().clearTyping(roomId, userId);
      }, 8200);
    } else {
      get().clearTyping(roomId, userId);
    }
  },

  clearTyping: (roomId, userId) => {
    set((prev) => {
      const roomTyping = prev.typing[roomId];
      if (!roomTyping) return prev;
      const expires = roomTyping.users[userId];
      if (!expires) return prev;
      if (expires > Date.now()) return prev;
      const rest = { ...roomTyping.users };
      delete rest[userId];
      const newTyping = { ...prev.typing };
      if (Object.keys(rest).length === 0) {
        delete newTyping[roomId];
      } else {
        newTyping[roomId] = { users: rest };
      }
      return { typing: newTyping };
    });
  },

  notifyTyping: (roomId, state) => {
    const authUser = useAuthStore.getState().user;
    if (!authUser) return;
    const socket = getSocket();
    socket.emit('chat:typing', { roomId, userId: authUser.id, state });
  },
}));
