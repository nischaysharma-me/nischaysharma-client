import { create } from 'zustand';

interface ReadingModeState {
  isEnabled: boolean;
  isSepiaEnabled: boolean;
  toggleReadingMode: () => void;
  toggleSepia: () => void;
  setIsEnabled: (enabled: boolean) => void;
  setIsSepiaEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'readingMode';

export const useReadingModeStore = create<ReadingModeState>((set) => ({
  isEnabled: false,
  isSepiaEnabled: false,
  toggleReadingMode: () => set((state) => ({ isEnabled: !state.isEnabled })),
  toggleSepia: () => set((state) => ({ isSepiaEnabled: !state.isSepiaEnabled })),
  setIsEnabled: (enabled) => set({ isEnabled: enabled }),
  setIsSepiaEnabled: (enabled) => set({ isSepiaEnabled: enabled }),
}));
