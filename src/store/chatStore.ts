import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  senderId: string;
  roomId: string;
  content: string;
  createdAt: number;
};

type ChatState = {
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clear: () => set({ messages: [] }),
}));
