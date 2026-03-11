import { useEffect, useState } from 'react';
import { initSocket, onJobEvent, disconnectSocket } from '@/services/socketService';
import { toast } from 'sonner';

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
          handleJobNotification(data);
        });
      }
    };

    setupSocket();

    return () => {
      if (cleanup) cleanup();
      disconnectSocket();
    };
  }, [deviceId]);

  const handleJobNotification = (data: any) => {
    const { type, status, id } = data;
    
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
  };

  return { isConnected };
};
