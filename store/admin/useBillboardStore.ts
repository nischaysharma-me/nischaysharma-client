import { create } from 'zustand';
import { Billboard } from '@/lib/types/billboard';
import { listBillboardsAction, createBillboardAction, updateBillboardAction, deleteBillboardAction, generateBillboardImageAction } from '@/lib/actions/billboard';
import { auth } from '@/lib/firebase';

interface BillboardState {
  billboards: Billboard[];
  loading: boolean;
  error: string | null;
  
  fetchBillboards: () => Promise<void>;
  createBillboard: (formData: FormData) => Promise<boolean>;
  updateBillboard: (id: string, formData: FormData) => Promise<boolean>;
  deleteBillboard: (id: string) => Promise<boolean>;
  generateImage: (id: string, prompt?: string) => Promise<boolean>;
}

export const useBillboardStore = create<BillboardState>((set, get) => ({
  billboards: [],
  loading: false,
  error: null,

  fetchBillboards: async () => {
    set({ loading: true });
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      const response = await listBillboardsAction(token);
      
      if (response.success) {
        set({ billboards: response.data, loading: false });
      } else {
        set({ error: response.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createBillboard: async (formData) => {
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      if (!token) return false;
      
      const response = await createBillboardAction(formData, token);
      if (response.success) {
        await get().fetchBillboards();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  updateBillboard: async (id, formData) => {
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      if (!token) return false;
      
      const response = await updateBillboardAction(id, formData, token);
      if (response.success) {
        await get().fetchBillboards();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  deleteBillboard: async (id) => {
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      if (!token) return false;
      
      const response = await deleteBillboardAction(id, token);
      if (response.success) {
        await get().fetchBillboards();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  generateImage: async (id, prompt) => {
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      if (!token) return false;
      
      const response = await generateBillboardImageAction(id, token, prompt);
      if (response.success) {
        await get().fetchBillboards();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}));
