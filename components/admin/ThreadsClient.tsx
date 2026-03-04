'use client';

import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { conversationsService, Message, Thread } from '@/services/conversations.service';
import { Button } from '@/components/ui/Button';
import AdminLoading from '@/app/admin/loading';
import { useRouter, useParams } from 'next/navigation';
import { useThreadsStore } from '@/store/admin/useThreadsStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ThreadsClient() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const threadIdFromUrl = params.id;

  const {
    threads,
    messages,
    loading,
    sending,
    setThreads,
    updateThread,
    deleteThread,
    setCurrentThreadId,
    setMessages,
    addMessage,
    updateLastAssistantMessage,
    setLoading,
    setSending,
    getSortedThreads
  } = useThreadsStore();

  const [input, setInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (threadIdFromUrl) {
      setCurrentThreadId(threadIdFromUrl);
      fetchThreadDetails(threadIdFromUrl);
      setIsAutoScrolling(true);
      setIsEditingTitle(false);
    } else {
      setCurrentThreadId(null);
      setMessages([]);
    }
  }, [threadIdFromUrl]);

  // Reactive current thread
  const currentThread = threads.find(t => t.id === threadIdFromUrl);

  useEffect(() => {
    if (currentThread) {
      setTitleInput(currentThread.title || '');
    }
  }, [currentThread]);

  useEffect(() => {
    if (isAutoScrolling) {
      scrollToBottom();
    }
  }, [messages, isAutoScrolling]);

  // When sending starts, force auto-scroll to bottom
  useEffect(() => {
    if (sending) {
      setIsAutoScrolling(true);
      scrollToBottom();
    }
  }, [sending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // If the user is within 100px of the bottom, assume they want auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAutoScrolling(isAtBottom);
  };

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

  const fetchThreadDetails = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await conversationsService.getThread(id, token);
      if (response.success) {
        setMessages(response.data.messages || []);
        updateThread(id, response.data);
      }
    } catch (err) {
      console.error('Error fetching thread details:', err);
      router.push('/admin/threads');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const originalInput = input;
    setInput('');
    setSending(true);
    setIsAutoScrolling(true); // Force to bottom on new message

    // Optimistic user message
    addMessage({ role: 'user', content: originalInput });

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      if (!threadIdFromUrl) {
        // Create new thread
        const response = await conversationsService.createThread({ message: originalInput }, token);
        if (response.success) {
          updateThread(response.data.id, response.data);
          router.push(`/admin/threads/${response.data.id}`);
          fetchThreads();
        }
      } else {
        // Stream reply for existing thread
        // Add placeholder assistant message
        addMessage({ role: 'assistant', content: '' });

        await conversationsService.streamReply(
          threadIdFromUrl, 
          originalInput, 
          token,
          (content) => {
            updateLastAssistantMessage(content);
          }
        );
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      addMessage({ role: 'assistant', content: `Error: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await conversationsService.deleteThread(id, token);
      if (response.success) {
        deleteThread(id);
        router.push('/admin/threads');
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      alert('Failed to delete');
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

  const handleUpdateTitle = async () => {
    if (!currentThread || !titleInput.trim() || titleInput === currentThread.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = await conversationsService.updateThread(currentThread.id, { title: titleInput }, token);
      if (response.success) {
        updateThread(currentThread.id, { title: titleInput });
        setIsEditingTitle(false);
      }
    } catch (err) {
      console.error('Error updating title:', err);
      alert('Failed to update title');
    }
  };

  if (loading) return <AdminLoading />;

  const sortedThreads = getSortedThreads();

  return (
    <div className={`threads-admin ${threadIdFromUrl ? 'threads-admin--chat-open' : ''}`}>
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

      <main className="threads-admin__chat-area">
        <header className="threads-admin__chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
             <button 
                className="threads-admin__back-btn" 
                onClick={() => router.push('/admin/threads')}
                title="Back"
             >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
             </button>
             
             {isEditingTitle ? (
               <input 
                autoFocus
                className="threads-admin__title-input"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #111',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  padding: '0',
                  outline: 'none',
                  width: '100%'
                }}
               />
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                 <h2 
                    onClick={() => setIsEditingTitle(true)}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit title"
                  >
                    {currentThread?.title || (threadIdFromUrl ? 'Loading...' : 'New Conversation')}
                  </h2>
                  {threadIdFromUrl && (
                    <button 
                      onClick={() => setIsEditingTitle(true)}
                      style={{ background: 'none', border: 'none', color: '#737373', padding: '0.2rem', opacity: 0.5 }}
                      className="threads-admin__edit-icon-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
               </div>
             )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {threadIdFromUrl && (
              <>
                <button 
                  onClick={(e) => handlePinToggle(e as any, currentThread!)}
                  style={{ background: 'none', border: 'none', color: currentThread?.isPinned ? '#111' : '#737373', padding: '0.4rem' }}
                  title={currentThread?.isPinned ? "Unpin" : "Pin"}
                >
                  <svg fill={currentThread?.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', transform: currentThread?.isPinned ? 'none' : 'rotate(45deg)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414M7 17v.01M17 7L7 17" /></svg>
                </button>
                <Button 
                  variant="ghost" 
                  style={{ padding: '0.4rem', color: '#ff6b6b' }} 
                  title="Delete Thread"
                  onClick={() => handleDelete(threadIdFromUrl)}
                >
                   <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="threads-admin__messages-container">
          <div className="threads-admin__messages" onScroll={handleScroll} ref={messagesContainerRef} data-lenis-prevent>
            {messages.map((m, i) => (
              <div key={i} className={`threads-admin__message threads-admin__message--${m.role}`}>
                <div className="threads-admin__message-bubble">
                  {m.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content || (sending && i === messages.length - 1 ? '...' : '')}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
                <div className="threads-admin__message-meta">
                  {m.role === 'assistant' ? 'AI Assistant' : 'You'}
                </div>
              </div>
            ))}
            
            {messages.length === 0 && !threadIdFromUrl && (
              <div className="threads-admin__empty-state">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  <h3>Start a new conversation</h3>
                  <p>Ask anything about your content, SEO, or platform management.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="threads-admin__fade-overlay" />
        </div>

        <div className="threads-admin__input-container">
          <div className="threads-admin__input-wrapper">
            <textarea 
              ref={textareaRef}
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
            />
            <button 
              type="button" 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
