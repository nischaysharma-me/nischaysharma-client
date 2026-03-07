import { create } from 'zustand';
import { Thread, Message } from '@/services/conversations.service';

interface ThreadsState {
  threads: Thread[];
  currentThreadId: string | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;

  // Actions
  setThreads: (threads: Thread[]) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  deleteThread: (threadId: string) => void;
  setCurrentThreadId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (content: string, role?: 'assistant' | 'image') => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  
  // Helpers
  getSortedThreads: () => Thread[];
}

export const useThreadsStore = create<ThreadsState>((set, get) => ({
  threads: [],
  currentThreadId: null,
  messages: [],
  loading: true,
  sending: false,

  setThreads: (threads) => set({ threads }),

  updateThread: (threadId, updates) => set((state) => ({
    threads: state.threads.map(t => t.id === threadId ? { ...t, ...updates } : t)
  })),

  deleteThread: (threadId) => set((state) => ({
    threads: state.threads.filter(t => t.id !== threadId),
    currentThreadId: state.currentThreadId === threadId ? null : state.currentThreadId,
    messages: state.currentThreadId === threadId ? [] : state.messages
  })),
  
  setCurrentThreadId: (id) => set({ currentThreadId: id }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),

  updateLastAssistantMessage: (content: string, role?: 'assistant' | 'image') => set((state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const targetRole = role || 'assistant';

    if (lastMessage && lastMessage.role === targetRole) {
      const newMessages = [...state.messages];

      // For images, we overwrite the placeholder with the URL. 
      // For text, we append chunks.
      const newContent = targetRole === 'image' ? content : (lastMessage.content + content);

      newMessages[newMessages.length - 1] = { 
        ...lastMessage, 
        content: newContent
      };
      return { messages: newMessages };
    }
    return state;
  }),


  setLoading: (loading) => set({ loading }),
  
  setSending: (sending) => set({ sending }),

  getSortedThreads: () => {
    const { threads } = get();
    return [...threads].sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by updatedAt
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
}));
