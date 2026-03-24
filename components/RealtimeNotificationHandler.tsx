'use client';

import { useEffect, useRef, useState } from 'react';
import { rtdb, auth } from '@/lib/firebase';
import { ref, onValue, off, remove, DataSnapshot } from 'firebase/database';
import { onAuthStateChanged, User } from 'firebase/auth';
import { toast } from 'sonner';
import { useJobSocket } from '@/hooks/useJobSocket';
import { v4 as uuidv4 } from 'uuid';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRouter } from 'next/navigation';

export default function RealtimeNotificationHandler() {
  const router = useRouter();
  const processedJobs = useRef<Set<string>>(new Set());
  
  // Fix: Use lazy initializer to prevent synchronous state update in effect
  const [deviceId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tc_device_id');
      if (stored) return stored;
      
      const newId = uuidv4();
      localStorage.setItem('tc_device_id', newId);
      return newId;
    }
    return undefined;
  });
  
  const [user, setUser] = useState<User | null>(null);
  const { addNotification } = useNotificationStore();

  // Track auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Use the WebSocket hook - only connects when user is present
  useJobSocket(user?.uid, deviceId);

  useEffect(() => {
    if (user) {
      const notificationsRef = ref(rtdb, `notifications/${user.uid}/jobs`);

      const handleValue = (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (!data) return;

        Object.keys(data).forEach((jobId) => {
          const job = data[jobId];

          // Only notify if we haven't processed this specific status update for this job
          const processKey = `${jobId}_${job.status}_${job.updatedAt}`;
          if (processedJobs.current.has(processKey)) return;
          processedJobs.current.add(processKey);

          let message = '';

          if (job.status === 'completed') {
            message = `Job Completed: ${job.type.replace(/-/g, ' ')}`;

            toast.success(message, {
              description: 'Your result is ready.',
              duration: Infinity,
              id: `job_${jobId}`,
              closeButton: true
            });

            // Trigger refresh for other components to fetch new data
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('tc:data-refresh', { 
                detail: { type: job.type, jobId: jobId } 
              }));
            }
            
            router.refresh();

            // Clean up the notification from RTDB after a delay
            setTimeout(() => {
                if (user?.uid) {
                    remove(ref(rtdb, `notifications/${user.uid}/jobs/${jobId}`));
                }
            }, 5000);
          } else if (job.status === 'failed') {
            message = `Job Failed: ${job.type.replace(/-/g, ' ')}`;

            toast.error(message, {
              description: job.message || 'An error occurred during processing.',
              duration: Infinity,
              id: `job_${jobId}`,
              closeButton: true
            });
            setTimeout(() => {
                if (user?.uid) {
                    remove(ref(rtdb, `notifications/${user.uid}/jobs/${jobId}`));
                }
            }, 5000);
          } else if (job.status === 'processing') {
            message = `Processing Started: ${job.type.replace(/-/g, ' ')}`;

            toast.info(message, {
              description: `Your ${job.type.replace(/-/g, ' ')} is being generated...`,
              duration: Infinity,
              id: `job_${jobId}`,
              closeButton: true
            });
          }
          if (message) {
            addNotification({
              type: job.type,
              status: job.status,
              message,
              timestamp: job.updatedAt || Date.now(),
              data: job
            });
          }
        });
      };

      onValue(notificationsRef, handleValue);

      return () => off(notificationsRef, 'value', handleValue);
    }
  }, [user, addNotification, router]);

  return null;
}
