import { create } from 'zustand';
import { Billboard } from '@/lib/types/billboard';
import { listBillboardsAction } from '@/lib/actions/billboard';

interface BillboardOverlayState {
  billboards: Billboard[];
  isOpen: boolean;
  loading: boolean;
  initialized: boolean;
  
  fetchBillboards: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

export const useBillboardOverlayStore = create<BillboardOverlayState>((set, get) => ({
  billboards: [],
  isOpen: false,
  loading: false,
  initialized: false,

  fetchBillboards: async () => {
    // Only fetch if not already initialized to avoid redundant calls
    if (get().initialized) return;
    
    set({ loading: true });
    try {
      // Fetch public billboards (active items)
      const response = await listBillboardsAction(undefined, true);
      if (response.success) {
        set({ billboards: response.data, loading: false, initialized: true });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Failed to pre-fetch billboards:', err);
      set({ loading: false });
    }
  },

  setIsOpen: (isOpen) => set({ isOpen }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
