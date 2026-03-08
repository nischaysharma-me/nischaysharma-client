'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Book, Page, Chapter, booksService } from '@/services/books.service';
import AdminLoading from '@/app/admin/loading';

interface BookPreviewClientProps {
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
  metadata: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
  pages?: Page[];
};

export default function BookPreviewClient({ bookId }: BookPreviewClientProps) {
  const router = useRouter();
  const [book, setBook] = useState<FullBook | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      alert('Failed to load book preview');
      router.push('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLoading />;
  if (!book) return <div style={{ padding: '4rem', textAlign: 'center' }}>Book not found</div>;

  return (
    <div className="book-preview-mode" style={{ background: '#fff', minHeight: '100vh', color: '#111' }}>
      {/* Floating Back Bar */}
      <div style={{ position: 'fixed', top: '2rem', left: '2rem', zIndex: 100 }}>
        <button 
          onClick={() => router.push(`/admin/books/${bookId}`)}
          style={{ 
            background: 'rgba(0,0,0,0.05)', 
            backdropFilter: 'blur(10px)',
            border: 'none', 
            borderRadius: '50%',
            width: '3rem',
            height: '3rem',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          title="Back to Editor"
        >
          <i className="ph ph-arrow-left" style={{ fontSize: '1.25rem' }} />
        </button>
      </div>

      <div className="book-preview" style={{ maxWidth: '750px', margin: '0 auto', padding: '8rem 2rem' }}>
        {/* Book Header */}
        <section className="book-preview__cover" style={{ textAlign: 'center', marginBottom: '8rem' }}>
          {book.coverImage && (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              style={{ width: '100%', maxWidth: '400px', borderRadius: '0.5rem', marginBottom: '3rem', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
            />
          )}
          <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.4em', opacity: 0.3, marginBottom: '1.5rem' }}>
            {book.type === 'book' ? 'Threaded Collection' : 'Technical Paper'}
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.05, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
            {book.title}
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
            {book.description}
          </p>
        </section>

        {/* Table of Contents */}
        <section className="book-preview__toc" style={{ marginBottom: '10rem', borderTop: '1px solid #f0f0f0', paddingTop: '4rem' }}>
           <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '3rem', fontWeight: 800 }}>Contents</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {book.chapters?.map((chapter, idx) => (
               <a key={chapter.id} href={`#chapter-${chapter.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span style={{ opacity: 0.2, fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>{String(idx + 1).padStart(2, '0')}</span>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{chapter.title}</span>
                  </div>
                  <div className="dot-line" style={{ borderBottom: '1px dotted #e0e0e0', flex: 1, margin: '0 1rem' }}></div>
                  <span style={{ opacity: 0.3, fontSize: '0.75rem', fontWeight: 700 }}>P.{idx + 1}</span>
                </div>
               </a>
             ))}
           </div>
        </section>

        {/* Chapters and Pages */}
        <div className="book-preview__content">
          {/* Render Root Pages (e.g. Intro, General sections) */}
          {book.pages && book.pages.length > 0 && (
            <section style={{ marginBottom: '8rem' }}>
              <div className="prose">
                {book.pages.map((page) => (
                  <div key={page.id} style={{ marginBottom: '3rem' }}>
                    <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: page.content }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {book.chapters?.map((chapter, cIdx) => (
            <section key={chapter.id} id={`chapter-${chapter.id}`} style={{ marginBottom: '10rem' }}>
              <div style={{ marginBottom: '4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.4 }}>
                    Chapter {cIdx + 1}
                  </span>
                  <h2 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '1rem', letterSpacing: '-0.02em' }}>
                    {chapter.title}
                  </h2>
              </div>

              <div className="prose">
                {chapter.pages && chapter.pages.length > 0 ? (
                  chapter.pages.map((page) => (
                    <div key={page.id} style={{ marginBottom: '3rem' }}>
                      <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: page.content }} />
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '3rem', background: '#fcfcfc', borderRadius: '0.75rem', border: '1px dashed #eee', textAlign: 'center', color: '#bbb', fontSize: '0.9rem' }}>
                    This chapter is currently being drafted.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <footer style={{ marginTop: '12rem', borderTop: '1px solid #f0f0f0', paddingTop: '4rem', textAlign: 'center' }}>
           <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.2 }}>
             End of Manuscript
           </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .book-preview-mode {
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .book-preview h1, .book-preview h2 {
          font-family: 'Instrument Serif', serif;
        }

        .prose {
          font-family: 'Inter', sans-serif;
          line-height: 1.8;
          color: #222;
        }

        .prose h1, .prose h2, .prose h3 {
          font-family: 'Instrument Serif', serif;
          color: #000;
          line-height: 1.2;
        }

        .prose h1 { font-size: 2.5rem; margin: 3rem 0 1.5rem; font-weight: 800; }
        .prose h2 { font-size: 2rem; margin: 2.5rem 0 1.25rem; font-weight: 700; }
        .prose h3 { font-size: 1.5rem; margin: 2rem 0 1rem; font-weight: 700; }
        
        .prose p { margin-bottom: 1.75rem; font-size: 1.15rem; color: #444; }
        
        .prose ul, .prose ol { margin-bottom: 1.75rem; padding-left: 1.5rem; }
        .prose li { margin-bottom: 0.75rem; font-size: 1.15rem; }
        
        .prose code { background: #f5f5f5; padding: 0.2rem 0.4rem; borderRadius: 4px; font-size: 0.9em; font-family: monospace; }
        .prose pre { background: #000; color: #fff; padding: 2rem; borderRadius: 0.75rem; overflow-x: auto; margin: 2.5rem 0; font-size: 0.95rem; }
        
        .prose img { max-width: 100%; borderRadius: 0.75rem; margin: 3rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        
        .prose blockquote { 
          border-left: 3px solid #000; 
          padding: 0.5rem 0 0.5rem 2rem; 
          font-style: italic; 
          color: #555; 
          margin: 3rem 0;
          font-size: 1.25rem;
          font-family: 'Instrument Serif', serif;
        }

        .prose hr {
          border: none;
          border-top: 1px solid #f0f0f0;
          margin: 4rem 0;
        }

        @media (max-width: 768px) {
          .book-preview { padding: 4rem 1.5rem !important; }
          .book-preview__cover h1 { font-size: 2.5rem !important; }
          .book-preview__cover p { font-size: 1.1rem !important; }
          .book-preview__cover { margin-bottom: 4rem !important; }
          .book-preview__toc { margin-bottom: 6rem !important; }
          .book-preview__toc .dot-line { display: none; }
          .book-preview__content h2 { font-size: 2rem !important; }
          .book-preview__content section { margin-bottom: 6rem !important; }
        }
      `}</style>
    </div>
  );
}
