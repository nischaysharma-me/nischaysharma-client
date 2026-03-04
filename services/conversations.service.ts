import { apiFetch, getBaseUrl } from './apiClient';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface Thread {
  id: string;
  title?: string;
  messages: Message[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  message: string;
  title?: string;
}

export const conversationsService = {
  /**
   * List all conversation threads for the current user
   */
  listThreads: (token: string) => {
    return apiFetch<{ success: boolean; data: Thread[] }>('/conversations', {
      method: 'GET',
      token,
    });
  },

  /**
   * Get a specific thread by ID
   */
  getThread: (threadId: string, token: string) => {
    return apiFetch<{ success: boolean; data: Thread }>(`/conversations/${threadId}`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Create a new conversation thread
   */
  createThread: (data: CreateThreadData, token: string) => {
    return apiFetch<{ success: boolean; data: Thread }>('/conversations', {
      method: 'POST',
      token,
      body: data,
    });
  },

  /**
   * Delete a conversation thread
   */
  deleteThread: (threadId: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/conversations/${threadId}`, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Stream a reply in an existing thread
   * Note: This returns a native Fetch Response to handle SSE/Streaming
   */
  streamReply: async (threadId: string, message: string, token: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/conversations/${threadId}/stream`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message }),
    });
  }
};
