import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';
import { getBaseUrl } from './apiClient';

let socket: Socket | null = null;

export const initSocket = async (deviceId?: string) => {
  if (socket?.connected) return socket;

  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    console.warn('SocketInit: No auth token available');
    return null;
  }

  // Get base API URL and convert to WebSocket URL
  const baseUrl = getBaseUrl().replace('/api/v1', '');
  
  socket = io(baseUrl, {
    auth: {
      token,
      deviceId
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('WebSocket: Connected', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket: Disconnected');
  });

  socket.on('connect_error', async (error) => {
    console.error('WebSocket Connection Error:', error);
    
    // Handle authentication errors (e.g., expired token)
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      console.log('WebSocket: Auth error detected, refreshing token...');
      try {
        const newToken = await auth.currentUser?.getIdToken(true);
        if (newToken && socket) {
          socket.auth = {
            ...socket.auth,
            token: newToken
          };
          console.log('WebSocket: Token refreshed, reconnecting...');
          socket.connect();
        }
      } catch (err) {
        console.error('WebSocket: Failed to refresh token:', err);
      }
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onJobEvent = (callback: (data: any) => void) => {
  if (!socket) return;
  
  socket.on('job:update', callback);
  socket.on('job:created', callback);
  socket.on('job:processing', callback);
  socket.on('job:completed', callback);
  socket.on('job:failed', callback);

  return () => {
    socket?.off('job:update', callback);
    socket?.off('job:created', callback);
    socket?.off('job:processing', callback);
    socket?.off('job:completed', callback);
    socket?.off('job:failed', callback);
  };
};
