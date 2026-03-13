'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Book, Page, Chapter, booksService } from '@/services/books.service';
import { Button } from '@/components/ui/Button';
import AdminLoading from '@/app/admin/loading';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { toast } from 'sonner';

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
  chapters: (Chapter & { pages: any[] })[];
  metadata: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
  pages?: any[];
};

export default function BookDetailClient({ bookId }: BookDetailClientProps) {
  const router = useRouter();
  const [book, setBook] = useState<FullBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string | 'root' | null>(null);

  useEffect(() => {
    fetchBookData();
  }, [bookId]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await booksService.getFullBook(bookId, token);

      if (response.success) {
        setBook(response.data);
        if (response.data.chapters && response.data.chapters.length > 0) {
          setActiveChapterId(response.data.chapters[0].id);
        } else if (response.data.pages && response.data.pages.length > 0) {
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

  if (loading) return <AdminLoading />;
  if (!book) return <div style={{ padding: '4rem', textAlign: 'center' }}>Book not found</div>;

  const activeChapter = activeChapterId === 'root' 
    ? { title: 'General Content', pages: book.pages || [] }
    : book.chapters.find(c => c.id === activeChapterId);

  const handlePageContentChange = (pageId: string, newContent: string) => {
    if (!book) return;
    setBook((prevBook) => {
      if (!prevBook) return prevBook;
      const newBook = { ...prevBook };
      if (activeChapterId === 'root') {
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
            <div style={{ fontSize: '0.6rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Editor</div>
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
              onClick={() => toast.info('Save coming soon!')}
            >
              <i className="ph ph-floppy-disk" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Chapter Selector */}
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

      <div className="book-editor__grid">
        {/* Sidebar: Chapters (Desktop) */}
        <aside className="book-editor__sidebar">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
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
        </aside>

        {/* Main Content Area: Pages */}
        <main className="book-editor__main">
           {activeChapter ? (
             <div className="book-editor__content">
                <div className="book-editor__chapter-header">
                  <input 
                    key={activeChapterId}
                    defaultValue={activeChapter.title}
                    readOnly={activeChapterId === 'root'}
                    style={activeChapterId === 'root' ? { opacity: 0.5 } : {}}
                  />
                  <div style={{ height: '1px', background: '#eee', marginTop: '1rem' }}></div>
                </div>

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
                       <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>No content for this chapter.</p>
                       <Button variant="secondary">Add New Page</Button>
                    </div>
                  )}
                </div>
             </div>
           ) : (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                Select a chapter to begin editing.
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
