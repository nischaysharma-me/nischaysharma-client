import { create } from 'zustand';

interface DialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'danger' | 'warning' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions | null;
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  options: null,
  openDialog: (options) => set({ isOpen: true, options }),
  closeDialog: () => set({ isOpen: false, options: null }),
}));
