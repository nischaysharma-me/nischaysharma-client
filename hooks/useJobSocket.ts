import { useEffect, useState } from 'react';
import { initSocket, onJobEvent, disconnectSocket } from '@/services/socketService';
import { toast } from 'sonner';
import { eventsService } from '@/services/events.service';
import { auth } from '@/lib/firebase';

export const useJobSocket = (deviceId?: string) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupSocket = async () => {
      const socket = await initSocket(deviceId);
      if (socket) {
        setIsConnected(socket.connected);
        
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        cleanup = onJobEvent((data) => {
          handleJobNotification(data, deviceId);
        });
      }
    };

    setupSocket();

    return () => {
      if (cleanup) cleanup();
      disconnectSocket();
    };
  }, [deviceId]);

  const handleJobNotification = async (data: any, devId?: string) => {
    const { type, status, id } = data;
    
    // Display Toast
    switch (status) {
      case 'queued':
        toast.info(`Job Queued: ${type}`, { description: `ID: ${id}` });
        break;
      case 'processing':
        toast.loading(`Job Processing: ${type}`, { description: `Progress: ${data.progress}%` });
        break;
      case 'completed':
        toast.success(`Job Completed: ${type}`, { description: `Successfully finished.` });
        break;
      case 'failed':
        toast.error(`Job Failed: ${type}`, { description: data.error || 'Unknown error occurred.' });
        break;
    }

    // Store event on server (Requirement: Save ONLY after successful reception on client)
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await eventsService.storeEvent({
          type: `job:${status}`,
          payload: data,
          deviceId: devId
        }, token);
      }
    } catch (err) {
      console.error('Failed to store received event:', err);
    }
  };

  return { isConnected };
};
