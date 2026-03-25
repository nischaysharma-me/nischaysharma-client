'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Book, Page, Chapter, booksService } from '@/services/books.service';
import { Thread, conversationsService } from '@/services/conversations.service';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useDialogStore } from '@/store/useDialogStore';
import AdminLoading from '@/app/admin/loading';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { toast } from 'sonner';
import { integrationsService, IntegrationsList } from '@/services/integrations.service';

interface BookDetailClientProps {
  bookId: string;
}

type FullBook = {
  id: string;
  userId: string;
  threadId: string | null;
  title: string;
  description: string;
  coverImage: string;
  status: 'draft' | 'published';
  type: 'book' | 'paper';
  chapters: (Chapter & { pages: Page[] })[];
  metadata: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
  pages?: Page[];
  allPages?: Page[];
};

export default function BookDetailClient({ bookId }: BookDetailClientProps) {
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const [book, setBook] = useState<FullBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string | 'root' | null>(null);
  
  // Thread state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('none');
  const [isAttachingThread, setIsAttachingThread] = useState(false);

  // Integrations state
  const [sharing, setSharing] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [linkedinPostText, setLinkedinPostText] = useState('');
  const [integrations, setIntegrations] = useState<IntegrationsList>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Debugging log to see what data is actually present
  useEffect(() => {
    if (book) {
      console.log('BookDetail: Current book data:', {
        id: book.id,
        type: book.type,
        pagesCount: book.pages?.length,
        allPagesCount: book.allPages?.length,
        chaptersCount: book.chapters?.length,
        activeChapterId
      });
    }
  }, [book, activeChapterId]);

  useEffect(() => {
    fetchBookData();
    fetchIntegrations();
    fetchThreads();
  }, [bookId]);

  const fetchThreads = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await conversationsService.listThreads(token);
      if (res.success) {
        setThreads(res.data);
      }
    } catch (err) {
      console.error('Error fetching threads:', err);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.list(token);
      if (res.success) setIntegrations(res.data);
    } catch (err) {
      console.error('Error fetching integrations:', err);
    }
  };

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await booksService.getFullBook(bookId, token);

      if (response.success) {
        const data = response.data;
        // If it's a paper, we strictly use pages and ignore chapters
        if (data.type === 'paper') {
          data.chapters = [];
        }
        
        setBook(data);
        setSelectedThreadId(data.threadId || 'none');
        setLinkedinPostText(`📚 Just published a new technical collection: "${response.data.title}"\n\n${response.data.description || ''}\n\nExplore it on TaughtCode.`);
        
        if (response.data.type === 'paper') {
          setActiveChapterId('root');
        } else if (response.data.chapters && response.data.chapters.length > 0) {
          setActiveChapterId(response.data.chapters[0].id);
        } else {
          setActiveChapterId('root');
        }
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      toast.error('Failed to load book data');
      router.push('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachThread = async () => {
    if (!book) return;
    try {
      setIsAttachingThread(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      let finalThreadId: string | null = null;
      if (selectedThreadId === 'new') {
        const threadRes = await conversationsService.createThread({
          title: `${book.title} - Drafting`,
          message: `I'm writing a ${book.type} called "${book.title}".`
        }, token);
        if (threadRes.success) {
          finalThreadId = threadRes.data.id;
        }
      } else if (selectedThreadId !== 'none') {
        finalThreadId = selectedThreadId;
      }

      const res = await booksService.updateBook(book.id, { threadId: finalThreadId } as Partial<Book>, token);
      if (res.success) {
        setBook({ ...book, threadId: finalThreadId });
        setSelectedThreadId(finalThreadId || 'none');
        // Re-fetch threads if we created a new one so it appears in list
        if (selectedThreadId === 'new') fetchThreads();
        toast.success('Thread attachment updated!');
      }
    } catch (err) {
      toast.error('Failed to update thread: ' + (err as Error).message);
    } finally {
      setIsAttachingThread(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!book) return;
    openDialog({
      title: 'Delete Book',
      message: `Are you sure you want to delete "${book.title}"? This will permanently remove all content associated with this ${book.type}.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token) return;

          const response = await booksService.deleteBook(book.id, token);
          if (response.success) {
            toast.success('Deleted successfully');
            router.push('/admin/books');
          }
        } catch (err) {
          toast.error('Failed to delete: ' + (err as Error).message);
        }
      }
    });
  };

  const handleCreatePage = async () => {
    if (!book) return;
    try {
      setIsCreatingPage(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await booksService.createPage(book.id, { 
        chapterId: activeChapterId !== 'root' ? (activeChapterId || undefined) : undefined,
        content: '<p>Start writing...</p>'
      }, token);

      if (res.success) {
        toast.success('Page added!');
        fetchBookData(); // Refresh the whole book structure
      }
    } catch (err) {
      toast.error('Failed to create page: ' + (err as Error).message);
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleSaveContent = async () => {
    if (!book || !activeChapter) return;
    try {
      setIsSaving(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      // Save all pages in the current active chapter/manuscript
      const savePromises = activeChapter.pages.map(page => 
        booksService.updatePage(book.id, page.id, { content: page.content }, token)
      );

      await Promise.all(savePromises);
      toast.success('All changes saved!');
    } catch (err) {
      toast.error('Failed to save some pages: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <AdminLoading />;
  if (!book) return <div style={{ padding: '4rem', textAlign: 'center' }}>Not found</div>;

  const isPaper = book.type === 'paper';

  const activeChapter = activeChapterId === 'root' || isPaper
    ? { 
        title: isPaper ? 'Manuscript' : 'General Content', 
        pages: isPaper ? (book.allPages || book.pages || []) : (book.pages || []) 
      }
    : book.chapters.find(c => c.id === activeChapterId);

  const handlePageContentChange = (pageId: string, newContent: string) => {
    if (!book) return;
    setBook((prevBook) => {
      if (!prevBook) return prevBook;
      const newBook = { ...prevBook };
      if (activeChapterId === 'root' || isPaper) {
        if (isPaper && newBook.allPages) {
          newBook.allPages = newBook.allPages.map((p) => p.id === pageId ? { ...p, content: newContent } : p);
        }
        newBook.pages = newBook.pages?.map((p) => p.id === pageId ? { ...p, content: newContent } : p);
      } else {
        newBook.chapters = newBook.chapters.map((c) => {
          if (c.id === activeChapterId) {
            return {
              ...c,
              pages: c.pages.map((p) => p.id === pageId ? { ...p, content: newContent } : p)
            };
          }
          return c;
        });
      }
      return newBook;
    });
  };

  const handleShareToLinkedIn = async () => {
    if (!book) return;
    try {
      setSharing(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const url = `${window.location.origin}/books/${book.id}`;

      const response = await integrationsService.shareToLinkedIn({
        text: linkedinPostText,
        url: url,
        title: book.title
      }, token);

      if (response.success) {
        toast.success('Successfully shared to LinkedIn!');
      }
    } catch (err) {
      toast.error('Failed to share to LinkedIn: ' + (err as Error).message);
    } finally {
      setSharing(false);
    }
  };

  const handleGenerateAIPost = async () => {
    if (!book) return;
    try {
      setGeneratingPost(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await integrationsService.generateAIPost({
        title: book.title,
        description: book.description,
        type: 'book'
      }, token);

      if (response.success) {
        setLinkedinPostText(response.data);
        toast.success('AI post generated!');
      }
    } catch (err) {
      toast.error('AI generation failed: ' + (err as Error).message);
    } finally {
      setGeneratingPost(false);
    }
  };

  return (
    <div className="book-editor">
      <header className="dashboard__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.5rem 1rem' }}>
          <button 
            onClick={() => router.push('/admin/books')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
          >
            <i className="ph ph-arrow-left" style={{ fontSize: '1.25rem' }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h2>
            <div style={{ fontSize: '0.6rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isPaper ? 'Paper' : 'Book'} Editor</div>
          </div>
          <div className="dashboard__header-actions">
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/admin/books/${bookId}/preview`)}
            >
              <i className="ph ph-eye" />
              <span>Preview</span>
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveContent}
              loading={isSaving}
              disabled={isSaving}
            >
              <i className="ph ph-floppy-disk" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Chapter Selector */}
      {!isPaper && (
        <div className="book-editor__mobile-nav">
          {book.pages && book.pages.length > 0 && (
            <button 
              onClick={() => setActiveChapterId('root')}
              className={`book-editor__chapter-pill ${activeChapterId === 'root' ? 'book-editor__chapter-pill--active' : ''}`}
            >
              General
            </button>
          )}
          {book.chapters.map((chapter) => (
            <button 
              key={chapter.id}
              onClick={() => setActiveChapterId(chapter.id)}
              className={`book-editor__chapter-pill ${activeChapterId === chapter.id ? 'book-editor__chapter-pill--active' : ''}`}
            >
              {chapter.title}
            </button>
          ))}
        </div>
      )}

      <div className="book-editor__grid">
        {/* Sidebar: Chapters (Desktop) */}
        <aside className="book-editor__sidebar">
           {!isPaper && (
             <>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '1rem' }}>
                 <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Chapters</h3>
                 <button style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}><i className="ph ph-plus-circle" /></button>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {book.pages && book.pages.length > 0 && (
                   <div 
                    onClick={() => setActiveChapterId('root')}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: activeChapterId === 'root' ? 700 : 400,
                      background: activeChapterId === 'root' ? '#fff' : 'transparent',
                      boxShadow: activeChapterId === 'root' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      gap: '0.75rem'
                    }}
                   >
                     <i className="ph ph-file-text" style={{ opacity: 0.3 }} />
                     <span>General Content</span>
                   </div>
                 )}

                 {book.chapters.map((chapter, idx) => (
                   <div 
                    key={chapter.id} 
                    onClick={() => setActiveChapterId(chapter.id)}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: activeChapterId === chapter.id ? 700 : 400,
                      background: activeChapterId === chapter.id ? '#fff' : 'transparent',
                      boxShadow: activeChapterId === chapter.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      gap: '0.75rem'
                    }}
                   >
                     <span style={{ opacity: 0.3 }}>{idx + 1}</span>
                     <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chapter.title}</span>
                   </div>
                 ))}
               </div>
             </>
           )}

           {isPaper && (
             <div 
              onClick={() => setActiveChapterId('root')}
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 700,
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}
             >
               <i className="ph ph-file-text" style={{ opacity: 0.3 }} />
               <span>Manuscript</span>
             </div>
           )}

           <div style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
             <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1rem' }}>Thread Settings</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <Select
                 value={selectedThreadId}
                 onChange={(e) => setSelectedThreadId(e.target.value)}
                 options={[
                   { value: 'none', label: 'No Thread Attached' },
                   { value: 'new', label: '+ Create new thread' },
                   ...threads.map(t => ({ value: t.id, label: t.title || 'Untitled Thread' }))
                 ]}
               />
               <Button 
                 variant="secondary" 
                 className="btn--full"
                 style={{ fontSize: '0.7rem', height: '2.5rem' }}
                 onClick={handleAttachThread}
                 disabled={isAttachingThread || selectedThreadId === (book.threadId || 'none')}
                 loading={isAttachingThread}
               >
                 Update Thread
               </Button>
             </div>
           </div>

           <div style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
             <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1rem', color: '#ff4d4f' }}>Danger Zone</h3>
             <Button 
               variant="secondary" 
               className="btn--full"
               style={{ fontSize: '0.7rem', height: '2.5rem', borderColor: '#ff4d4f', color: '#ff4d4f' }}
               onClick={handleDeleteBook}
             >
               Delete {isPaper ? 'Paper' : 'Book'}
             </Button>
           </div>

           {book.status === 'published' && (
            <div style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
              <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1.5rem' }}>Distribution</h3>
              
              {!integrations.linkedin?.connected ? (
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Connect LinkedIn in profile settings to share.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label" style={{ fontSize: '0.65rem', margin: 0 }}>LinkedIn Post</label>
                    <button 
                      onClick={handleGenerateAIPost} 
                      disabled={generatingPost}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      {generatingPost ? <i className="ph ph-spinner animate-spin" /> : <i className="ph ph-sparkle" />}
                      AI Gen
                    </button>
                  </div>
                  <textarea 
                    className="input" 
                    style={{ height: '100px', resize: 'vertical', padding: '0.5rem', fontSize: '0.75rem', background: '#fff' }}
                    value={linkedinPostText}
                    onChange={(e) => setLinkedinPostText(e.target.value)}
                  />
                  <Button 
                    variant="secondary" 
                    className="btn--full"
                    style={{ background: '#0077b5', color: '#fff', border: 'none', fontSize: '0.7rem', height: '2.5rem' }}
                    onClick={handleShareToLinkedIn}
                    disabled={sharing}
                    loading={sharing}
                  >
                    <i className="ph ph-linkedin-logo" style={{ marginRight: '0.4rem' }} />
                    <span>Share Now</span>
                  </Button>
                </div>
              )}
            </div>
           )}
        </aside>

        {/* Main Content Area: Pages */}
        <main className="book-editor__main">
           {activeChapter ? (
             <div className="book-editor__content">
                <div className="book-editor__chapter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input 
                    key={activeChapterId}
                    defaultValue={activeChapter.title}
                    readOnly={activeChapterId === 'root' || isPaper}
                    style={activeChapterId === 'root' || isPaper ? { opacity: 0.5, border: 'none', flex: 1 } : { border: 'none', flex: 1 }}
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleCreatePage}
                    loading={isCreatingPage}
                    style={{ height: '1.8rem', fontSize: '0.65rem' }}
                  >
                    <i className="ph ph-plus" />
                    <span>Add Page</span>
                  </Button>
                </div>
                <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0 1rem' }}></div>

                <div className="prose-editor">
                  {activeChapter.pages && activeChapter.pages.length > 0 ? (
                    activeChapter.pages.map((page) => (
                      <div key={page.id} style={{ marginBottom: '2rem', position: 'relative' }}>
                        <TiptapEditor
                          content={page.content}
                          onChange={(newContent) => handlePageContentChange(page.id, newContent)}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', border: '2px dashed #eee', borderRadius: '1rem' }}>
                       <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>No content for this {isPaper ? 'paper' : 'chapter'}.</p>
                       <Button 
                         variant="secondary" 
                         onClick={handleCreatePage}
                         loading={isCreatingPage}
                       >
                         Add New Page
                       </Button>
                    </div>
                  )}
                </div>
             </div>
           ) : (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                Select a {isPaper ? 'page' : 'chapter'} to begin editing.
             </div>
           )}
        </main>
      </div>

      <style jsx global>{`
        .prose-editor p { margin-bottom: 1.5rem; line-height: 1.7; font-size: 1.1rem; }
        .prose-editor h1, .prose-editor h2 { font-family: serif; margin: 2rem 0 1rem; }
        
        @media (max-width: 768px) {
          .prose-editor p { font-size: 1rem; line-height: 1.6; }
          .prose-editor h1 { font-size: 1.75rem; }
          .prose-editor h2 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
