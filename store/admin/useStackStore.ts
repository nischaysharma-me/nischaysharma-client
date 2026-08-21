import { create } from 'zustand';
import { stackService } from '@/services/stack.service';
import { StackItem, CreateStackItemData } from '@/lib/types/stack';
import { getAuthToken } from '@/lib/auth';

interface StackState {
  items: StackItem[];
  loading: boolean;
  processingId: string | null;

  // Actions
  setItems: (items: StackItem[]) => void;
  fetchItems: () => Promise<void>;
  addItem: (data: CreateStackItemData) => Promise<boolean>;
  updateItem: (id: string, data: Partial<CreateStackItemData>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  generateImage: (id: string, prompt: string) => Promise<boolean>;
}

export const useStackStore = create<StackState>((set, get) => ({
  items: [],
  loading: false,
  processingId: null,

  setItems: (items) => set({ items }),

  fetchItems: async () => {
    try {
      set({ loading: true });
      const response = await stackService.listStackItems();
      if (response.success) {
        set({ items: response.data });
      }
    } catch (err) {
      console.error('Error fetching stack items:', err);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (data) => {
    try {
      set({ loading: true });
      const token = await getAuthToken();
      if (!token) return false;

      const response = await stackService.createStackItem(data, token);
      if (response.success) {
        await get().fetchItems();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding stack item:', err);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (id, data) => {
    try {
      set({ processingId: id });
      const token = await getAuthToken();
      if (!token) return false;

      const response = await stackService.updateStackItem(id, data, token);
      if (response.success) {
        await get().fetchItems();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating stack item:', err);
      return false;
    } finally {
      set({ processingId: null });
    }
  },

  deleteItem: async (id) => {
    try {
      set({ processingId: id });
      const token = await getAuthToken();
      if (!token) return false;

      const response = await stackService.deleteStackItem(id, token);
      if (response.success) {
        await get().fetchItems();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting stack item:', err);
      return false;
    } finally {
      set({ processingId: null });
    }
  },

  generateImage: async (id, prompt) => {
    try {
      set({ processingId: id });
      const token = await getAuthToken();
      if (!token) return false;

      const response = await stackService.generateStackItemImage(id, prompt, token);
      return response.success;
    } catch (err) {
      console.error('Error generating stack image:', err);
      return false;
    } finally {
      set({ processingId: null });
    }
  }
}));
