import { create } from 'zustand';

export type User = {
  id: string;
  email: string;
  displayName: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
};

type UserState = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
