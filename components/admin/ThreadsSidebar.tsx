'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { conversationsService, Thread } from '@/services/conversations.service';
import { Button } from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { useThreadsStore } from '@/store/admin/useThreadsStore';
import { toast } from 'sonner';

export default function ThreadsSidebar() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const threadIdFromUrl = params.id;
  const [isCreating, setIsCreating] = useState(false);

  const {
    threads,
    setThreads,
    updateThread,
    getSortedThreads,
    setLoading
  } = useThreadsStore();

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await conversationsService.listThreads(token);
      if (response.success) {
        setThreads(response.data);
      }
    } catch (err) {
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setIsCreating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await conversationsService.createThread({ 
        message: '', // Initial empty message or default
        title: 'New Conversation' 
      }, token);

      if (response.success) {
        // Add to store so it appears in list immediately
        setThreads([response.data, ...threads]);
        router.push(`/admin/threads/${response.data.id}`);
      }
    } catch (err) {
      console.error('Error creating new chat:', err);
      toast.error('Failed to create new conversation');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePinToggle = async (e: React.MouseEvent, thread: Thread) => {
    e.stopPropagation();
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = thread.isPinned 
        ? await conversationsService.unpinThread(thread.id, token)
        : await conversationsService.pinThread(thread.id, token);
        
      if (response.success) {
        updateThread(thread.id, { isPinned: !thread.isPinned });
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const sortedThreads = getSortedThreads();

  return (
    <aside className="threads-admin__sidebar">
      <div className="threads-admin__sidebar-header">
        <h3>Conversations</h3>
        <Button 
          variant="primary" 
          style={{ padding: '0.4rem' }} 
          title="New Chat" 
          onClick={handleNewChat}
          disabled={isCreating}
          loading={isCreating}
        >
          <i className="ph ph-plus" style={{ fontSize: '1rem' }} />
        </Button>
      </div>
      <div className="threads-admin__thread-list" data-lenis-prevent>
        {sortedThreads.length > 0 ? (
          sortedThreads.map((t) => (
            <div 
              key={t.id} 
              className={`threads-admin__thread-item ${threadIdFromUrl === t.id ? 'threads-admin__thread-item--active' : ''}`}
              onClick={() => router.push(`/admin/threads/${t.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div className="threads-admin__thread-item-title">{t.title || 'Untitled'}</div>
                <button 
                  onClick={(e) => handlePinToggle(e, t)}
                  style={{ background: 'none', border: 'none', padding: '0.2rem', color: t.isPinned ? '#111' : '#a3a3a3', opacity: t.isPinned ? 1 : 0.4 }}
                  title={t.isPinned ? "Unpin" : "Pin"}
                >
                  <i className={`ph-push-pin ${t.isPinned ? 'ph-fill' : 'ph'}`} style={{ fontSize: '0.85rem', transform: t.isPinned ? 'none' : 'rotate(45deg)', display: 'inline-block' }} />
                </button>
              </div>
              <div className="threads-admin__thread-item-meta">
                <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{t.messages?.length || 0} msgs</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#a3a3a3', fontSize: '0.8rem' }}>
            No conversations yet
          </div>
        )}
      </div>
    </aside>
  );
}
