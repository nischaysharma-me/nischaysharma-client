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
                  style={{ background: 'none', border: 'none', padding: '0', color: t.isPinned ? '#111' : '#a3a3a3', opacity: t.isPinned ? 1 : 0.4 }}
                >
                  <svg fill={t.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.75rem', height: '0.75rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
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
