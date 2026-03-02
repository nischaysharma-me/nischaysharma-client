import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AppState {
  // UI State
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;

  // Auth State (Client-side mirror)
  user: User | null;
  setUser: (user: User | null) => void;

  // Active Tab for Admin
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
}

export const useStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  user: null,
  setUser: (user) => set({ user }),

  activeAdminTab: 'Overview',
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
}));
