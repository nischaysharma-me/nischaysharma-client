'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import { conversationsService, Message, Thread } from '@/services/conversations.service';
import { Button } from '@/components/ui/Button';
import AdminLoading from '@/app/admin/loading';
import { useRouter, useParams } from 'next/navigation';
import { useThreadsStore } from '@/store/admin/useThreadsStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const threadId = params.id;

  const {
    threads,
    messages,
    sending,
    updateThread,
    deleteThread,
    setCurrentThreadId,
    setMessages,
    addMessage,
    updateLastAssistantMessage,
    setSending
  } = useThreadsStore();

  const [input, setInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Derived current thread for reactivity
  const currentThread = useMemo(() => 
    threads.find(t => t.id === threadId),
  [threads, threadId]);

  useEffect(() => {
    if (threadId) {
      setCurrentThreadId(threadId);
      
      // If we are switching to an EXISTING thread that isn't the one currently in the store,
      // we clear messages to trigger the loading state for visual feedback.
      // But if we just started a NEW chat (sending is true), we don't clear so the messages stay visible.
      if (!sending) {
        setMessages([]);
        fetchThreadDetails(threadId);
      } else {
        // Just sync metadata
        syncThreadDetails(threadId);
      }

      setIsAutoScrolling(true);
      setIsEditingTitle(false);
    } else {
      setCurrentThreadId(null);
      setMessages([]);
    }
  }, [threadId]);

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

  useEffect(() => {
    if (sending) {
      setIsAutoScrolling(true);
      scrollToBottom();
    }
  }, [sending]);

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
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAutoScrolling(isAtBottom);
  };

  const syncThreadDetails = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await conversationsService.getThread(id, token);
      if (response.success) {
        updateThread(id, response.data);
      }
    } catch (err) {
      console.error('Error syncing thread details:', err);
    }
  };

  const fetchThreadDetails = async (id: string) => {
    try {
      setFetchingDetails(true);
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
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const originalInput = input;
    setInput('');
    setSending(true);
    setIsAutoScrolling(true);

    addMessage({ role: 'user', content: originalInput });

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      if (!threadId) {
        // Create new thread
        const response = await conversationsService.createThread({ message: originalInput }, token);
        if (response.success) {
          // Add to store so it's ready before navigation
          updateThread(response.data.id, response.data);
          router.push(`/admin/threads/${response.data.id}`);
        }
      } else {
        addMessage({ role: 'assistant', content: '' });

        await conversationsService.streamReply(
          threadId, 
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

  const handleDelete = async () => {
    if (!threadId || !confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await conversationsService.deleteThread(threadId, token);
      if (response.success) {
        deleteThread(threadId);
        router.push('/admin/threads');
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      alert('Failed to delete');
    }
  };

  const handlePinToggle = async (e: React.MouseEvent) => {
    if (!currentThread) return;
    e.stopPropagation();
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = currentThread.isPinned 
        ? await conversationsService.unpinThread(currentThread.id, token)
        : await conversationsService.pinThread(currentThread.id, token);
        
      if (response.success) {
        updateThread(currentThread.id, { isPinned: !currentThread.isPinned });
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

  // Only block the whole UI if we are literally doing a fetch and have no messages to show
  if (fetchingDetails && messages.length === 0) return <AdminLoading />;

  return (
    <main className="threads-admin__chat-area">
      <header className="threads-admin__chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
           <button 
              className="threads-admin__back-btn" 
              onClick={() => router.push('/admin/threads')}
              title="Back"
           >
              <i className="ph ph-caret-left" style={{ fontSize: '1.25rem' }} />
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
                  {currentThread?.title || (threadId ? 'Loading...' : 'New Conversation')}
                </h2>
                {threadId && (
                  <button 
                    onClick={() => setIsEditingTitle(true)}
                    style={{ background: 'none', border: 'none', color: '#737373', padding: '0.2rem', opacity: 0.5 }}
                    className="threads-admin__edit-icon-btn"
                  >
                    <i className="ph ph-pencil-simple" style={{ fontSize: '0.85rem' }} />
                  </button>
                )}
             </div>
           )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {threadId && (
            <>
              <button 
                onClick={handlePinToggle}
                style={{ background: 'none', border: 'none', color: currentThread?.isPinned ? '#111' : '#737373', padding: '0.4rem' }}
                title={currentThread?.isPinned ? "Unpin" : "Pin"}
              >
                <i className={`ph-push-pin ${currentThread?.isPinned ? 'ph-fill' : 'ph'}`} style={{ fontSize: '1rem', transform: currentThread?.isPinned ? 'none' : 'rotate(45deg)', display: 'inline-block' }} />
              </button>
              <Button 
                variant="ghost" 
                style={{ padding: '0.4rem', color: '#ff6b6b' }} 
                title="Delete Thread"
                onClick={handleDelete}
              >
                 <i className="ph ph-trash" style={{ fontSize: '1rem' }} />
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
          
          {messages.length === 0 && !threadId && (
            <div className="threads-admin__empty-state">
                <i className="ph ph-chat-circle-dots" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.15 }} />
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
              <i className="ph ph-spinner animate-spin" style={{ fontSize: '1rem' }} />
            ) : (
              <i className="ph ph-paper-plane-tilt" style={{ fontSize: '1.25rem' }} />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
