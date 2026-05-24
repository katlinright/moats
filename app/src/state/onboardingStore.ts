import { create } from 'zustand';

interface OnboardingState {
  declarationReadAt: number | null;
  covenantAcceptedAt: number | null;
  covenantHash: string | null;
  seedVerifiedAt: number | null;
  isComplete: boolean;

  setDeclarationRead: () => void;
  setCovenant: (hash: string) => void;
  setSeedVerified: () => void;
  setComplete: () => void;
  hydrateComplete: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  declarationReadAt: null,
  covenantAcceptedAt: null,
  covenantHash: null,
  seedVerifiedAt: null,
  isComplete: false,

  setDeclarationRead: () => set({ declarationReadAt: Date.now() }),
  setCovenant: (hash) => set({ covenantAcceptedAt: Date.now(), covenantHash: hash }),
  setSeedVerified: () => set({ seedVerifiedAt: Date.now() }),
  setComplete: () => set({ isComplete: true }),
  hydrateComplete: () => set({ isComplete: true }),
}));
