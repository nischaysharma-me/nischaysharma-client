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
  setCurrentThreadId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  
  // Helper to get current thread
  getCurrentThread: () => Thread | undefined;
}

export const useThreadsStore = create<ThreadsState>((set, get) => ({
  threads: [],
  currentThreadId: null,
  messages: [],
  loading: true,
  sending: false,

  setThreads: (threads) => set({ threads }),
  
  setCurrentThreadId: (id) => set({ currentThreadId: id }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),

  updateLastAssistantMessage: (content) => set((state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = { 
        ...lastMessage, 
        content: lastMessage.content + content 
      };
      return { messages: newMessages };
    }
    return state;
  }),

  setLoading: (loading) => set({ loading }),
  
  setSending: (sending) => set({ sending }),

  getCurrentThread: () => {
    const state = get();
    return state.threads.find(t => t.id === state.currentThreadId);
  }
}));
