'use client';

import { useEffect, useRef } from 'react';
import { rtdb, auth } from '@/lib/firebase';
import { ref, onValue, off, remove } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

export default function RealtimeNotificationHandler() {
  const processedJobs = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const notificationsRef = ref(rtdb, `notifications/${user.uid}/jobs`);
        
        onValue(notificationsRef, (snapshot) => {
          const data = snapshot.val();
          if (!data) return;

          Object.keys(data).forEach((jobId) => {
            const job = data[jobId];
            
            // Only notify if we haven't processed this specific status update for this job
            const processKey = `${jobId}_${job.status}_${job.updatedAt}`;
            if (processedJobs.current.has(processKey)) return;
            processedJobs.current.add(processKey);

            if (job.status === 'completed') {
              toast.success('Job Completed', {
                description: `${job.type.replace(/-/g, ' ')} is ready.`,
                duration: 5000,
              });
              // Clean up the notification from RTDB after a delay
              setTimeout(() => remove(ref(rtdb, `notifications/${user.uid}/jobs/${jobId}`)), 2000);
            } else if (job.status === 'failed') {
              toast.error('Job Failed', {
                description: job.message || 'An error occurred during processing.',
                duration: 6000,
              });
              setTimeout(() => remove(ref(rtdb, `notifications/${user.uid}/jobs/${jobId}`)), 2000);
            } else if (job.status === 'processing' && job.progress === 10) {
              toast.info('Processing Started', {
                description: `Your ${job.type.replace(/-/g, ' ')} is being generated...`,
              });
            }
          });
        });

        return () => off(notificationsRef);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return null;
}
