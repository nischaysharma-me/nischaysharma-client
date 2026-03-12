import { apiFetch } from './apiClient';

export interface TCodeEvent {
  id?: string;
  userId: string;
  type: string;
  payload: any;
  source: string;
  receivedAt: string;
  deviceId?: string;
}

export const eventsService = {
  /**
   * Store a received WebSocket event on the server
   */
  storeEvent: (data: { type: string; payload: any; deviceId?: string }, token: string) => {
    return apiFetch<{ success: boolean; data: TCodeEvent }>('/events', {
      method: 'POST',
      token,
      body: data,
    });
  },

  /**
   * List event history for the user
   */
  listEvents: (token: string) => {
    return apiFetch<{ success: boolean; data: TCodeEvent[] }>('/events', {
      method: 'GET',
      token,
    });
  }
};
