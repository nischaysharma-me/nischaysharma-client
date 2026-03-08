'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Book, Page, Chapter, booksService } from '@/services/books.service';
import { Button } from '@/components/ui/Button';
import AdminLoading from '@/app/admin/loading';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BookDetailClientProps {
  bookId: string;
}

type FullBook = Book & { chapters: (Chapter & { pages: Page[] })[] };

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
      alert('Failed to load book data');
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

  return (
    <div className="book-editor">
      <header className="dashboard__header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.5rem 2rem' }}>
          <button 
            onClick={() => router.push('/admin/books')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <i className="ph ph-arrow-left" style={{ fontSize: '1.25rem' }} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>{book.title}</h2>
            <div style={{ fontSize: '0.65rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manuscript Editor</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/admin/books/${bookId}/preview`)}
              style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
            >
              <i className="ph ph-eye" style={{ marginRight: '0.5rem' }} />
              Preview
            </Button>
            <Button 
              variant="primary" 
              onClick={() => alert('Save coming soon!')}
              style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <div className="dashboard__grid-layout" style={{ height: 'calc(100vh - 4.5rem)', overflow: 'hidden' }}>
        {/* Sidebar: Chapters */}
        <aside style={{ borderRight: '1px solid #eee', background: '#fafafa', overflowY: 'auto', padding: '2rem 1rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
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
        <main style={{ gridColumn: 'span 2', overflowY: 'auto', padding: '4rem' }}>
           {activeChapter ? (
             <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '4rem' }}>
                  <input 
                    defaultValue={activeChapter.title}
                    style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 900, 
                      border: 'none', 
                      outline: 'none', 
                      width: '100%',
                      fontFamily: 'serif' 
                    }}
                  />
                  <div style={{ height: '1px', background: '#eee', marginTop: '1rem' }}></div>
                </div>

                <div className="prose-editor">
                  {activeChapter.pages && activeChapter.pages.length > 0 ? (
                    activeChapter.pages.map((page) => (
                      <div key={page.id} style={{ marginBottom: '2rem', position: 'relative', padding: '1rem', border: '1px solid transparent', borderRadius: '0.5rem' }}>
                        <div className="page-actions" style={{ position: 'absolute', right: '1rem', top: '1rem', opacity: 0 }}>
                           <button className="btn--ghost"><i className="ph ph-trash" /></button>
                        </div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {page.content}
                        </ReactMarkdown>
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
        .page-item:hover .page-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
