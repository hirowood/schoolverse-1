import { create } from 'zustand';

type VoiceState = {
  muted: boolean;
  setMuted: (v: boolean) => void;
};

export const useVoiceStore = create<VoiceState>((set) => ({
  muted: true,
  setMuted: (v) => set({ muted: v }),
}));
