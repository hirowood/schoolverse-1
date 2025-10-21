import { create } from 'zustand';

type Position = { x: number; y: number };

type SpaceState = {
  roomId: string | null;
  position: Position;
  setRoom: (id: string | null) => void;
  setPosition: (p: Position) => void;
};

export const useSpaceStore = create<SpaceState>((set) => ({
  roomId: null,
  position: { x: 0, y: 0 },
  setRoom: (id) => set({ roomId: id }),
  setPosition: (p) => set({ position: p }),
}));
