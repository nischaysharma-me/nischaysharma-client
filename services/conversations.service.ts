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
   * Handles the reading and parsing of the SSE stream
   */
  streamReply: async (
    threadId: string, 
    message: string, 
    token: string, 
    onContent: (content: string) => void,
    onDone?: () => void
  ) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/conversations/${threadId}/stream`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Streaming request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body available for streaming');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Split by lines (SSE format: data: {...}\n\n)
        const lines = buffer.split('\n');
        
        // Keep the potentially incomplete last line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            
            if (dataStr === '[DONE]') {
              if (onDone) onDone();
              return;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                onContent(data.content);
              }
            } catch (e) {
              // If JSON parsing fails, it might be a partial chunk, 
              // but since we split by \n, this shouldn't happen often.
              console.warn('Incomplete JSON in SSE stream:', dataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
};
