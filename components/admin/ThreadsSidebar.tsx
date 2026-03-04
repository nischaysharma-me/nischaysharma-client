'use client';

import React, { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { conversationsService, Thread } from '@/services/conversations.service';
import { Button } from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { useThreadsStore } from '@/store/admin/useThreadsStore';

export default function ThreadsSidebar() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const threadIdFromUrl = params.id;

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
        <Button variant="primary" style={{ padding: '0.4rem' }} title="New Chat" onClick={() => router.push('/admin/threads')}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
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
                  <svg fill={t.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem', transform: t.isPinned ? 'none' : 'rotate(45deg)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414M7 17v.01M17 7L7 17" /></svg>
                </button>              </div>
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
