import { create } from 'zustand';

export interface CompassEntry {
  id: number;
  cycleNumber: number;
  whatToFix: string;
  whyForWhom: string;
  createdAt: number;
  lockedUntil: number;
}

interface CompassState {
  current: CompassEntry | null;
  isLocked: () => boolean;
  setCurrent: (entry: CompassEntry) => void;
  clear: () => void;
}

export const useCompassStore = create<CompassState>((set, get) => ({
  current: null,
  isLocked: () => {
    const entry = get().current;
    return entry !== null && Date.now() / 1000 < entry.lockedUntil;
  },
  setCurrent: (entry) => set({ current: entry }),
  clear: () => set({ current: null }),
}));
