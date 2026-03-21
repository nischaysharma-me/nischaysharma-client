import { useEffect, useState, useCallback } from 'react';
import { initSocket, onJobEvent, disconnectSocket } from '@/services/socketService';
import { toast } from 'sonner';
import { eventsService } from '@/services/events.service';
import { auth } from '@/lib/firebase';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRouter } from 'next/navigation';

export const useJobSocket = (userId?: string, deviceId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useNotificationStore();
  const router = useRouter();

  const handleDataRefresh = useCallback((jobType: string) => {
    console.log(`Refreshing data for job type: ${jobType}`);

    // Refresh the current Next.js route data
    router.refresh();

    // Trigger specific window events that components can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tc:data-refresh', { detail: { type: jobType } }));

      // Specifically handle article generation to let the UI know to re-fetch
      if (jobType === 'article-generation') {
        window.dispatchEvent(new CustomEvent('tc:articles-update'));
      }

      // Specifically handle book page generation
      if (jobType === 'book-page-generation') {
        window.dispatchEvent(new CustomEvent('tc:book-update'));
      }
    }
  }, [router]);

  const handleJobNotification = useCallback(async (data: any, devId?: string) => {
    const { type, status, id } = data;

    let message = '';
    let toastType: 'info' | 'success' | 'error' | 'message' = 'info';

    // Map status to human-readable message and toast type
    switch (status) {
      case 'queued':
        message = `Job Queued: ${type.replace(/-/g, ' ')}`;
        toastType = 'info';
        break;
      case 'processing':
        message = `Job Processing: ${type.replace(/-/g, ' ')} (${data.progress}%)`;
        toastType = 'message'; // Use generic toast for processing to get close button
        break;
      case 'completed':
        message = `Job Completed: ${type.replace(/-/g, ' ')}`;
        toastType = 'success';
        break;
      case 'failed':
        message = `Job Failed: ${type.replace(/-/g, ' ')}`;
        toastType = 'error';
        break;
    }

    // Display Persistent Toast
    const toastOptions = { 
      description: status === 'failed' ? (data.error || 'An error occurred.') : `ID: ${id}`,
      duration: Infinity, 
      id: `job_${id}`, // Use job ID as toast ID to overwrite status updates for same job
      closeButton: true,
    };

    if (toastType === 'message') {
      toast(message, {
        ...toastOptions,
        icon: <i className="ph ph-spinner animate-spin" style={{ color: '#111' }} />
      });
    } else {
      // Use type assertion to satisfy TypeScript that toastType is a valid key
      (toast as any)[toastType](message, toastOptions);
    }

    // Handle Data Re-fetching on Completion
    if (status === 'completed') {
      handleDataRefresh(type);
    }

    // Add to Notification Store
    addNotification({
      type,
      status,
      message,
      timestamp: Date.now(),
      data: data
    });

    // Store event on server
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
  }, [addNotification, handleDataRefresh]);

  useEffect(() => {
    if (!userId) return;

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
  }, [userId, deviceId, handleJobNotification]);

  return { isConnected };
};
