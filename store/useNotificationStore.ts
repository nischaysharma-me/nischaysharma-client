import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'read' | 'id'> & { id?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notif) => set((state) => {
        const id = notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Prevent duplicate notifications for the same job status
        const isDuplicate = state.notifications.some(
          n => n.id === id || (n.data?.id === notif.data?.id && n.status === notif.status)
        );
        
        if (isDuplicate) return state;

        const newNotif: Notification = {
          ...notif,
          id,
          read: false
        };

        const updatedNotifications = [newNotif, ...state.notifications].slice(0, 50); // Keep last 50
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.read).length
        };
      }),

      markAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      }),

      markAllAsRead: () => set((state) => {
        const updated = state.notifications.map(n => ({ ...n, read: true }));
        return {
          notifications: updated,
          unreadCount: 0
        };
      }),

      clearAll: () => set({
        notifications: [],
        unreadCount: 0
      }),

      removeNotification: (id) => set((state) => {
        const updated = state.notifications.filter(n => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      })
    }),
    {
      name: 'tc_notifications_storage'
    }
  )
);
