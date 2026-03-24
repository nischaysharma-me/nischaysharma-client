'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Book, booksService } from '@/services/books.service';
import { Thread, conversationsService } from '@/services/conversations.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import AdminLoading from '@/app/admin/loading';
import { useBookStore } from '@/store/admin/useBookStore';
import { useDialogStore } from '@/store/useDialogStore';
import { toast } from 'sonner';

interface BooksClientProps {
  initialBooks: Book[];
}

export default function BooksClient({ initialBooks }: BooksClientProps) {
  const { books, setBooks, addBook, deleteBook, setLoading, loading } = useBookStore();
  const { openDialog } = useDialogStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
  const [newBookType, setNewBookType] = useState<'book' | 'paper'>('book');
  
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('new');

  // Hydrate store on mount
  useEffect(() => {
    fetchBooks();
    fetchThreads();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await booksService.getUserBooks(token);
      if (response.success) {
        setBooks(response.data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      let finalThreadId: string | undefined = undefined;

      if (selectedThreadId === 'new') {
        const threadRes = await conversationsService.createThread({
          title: `${newBookTitle} - Drafting`,
          message: `I am starting a new ${newBookType} called "${newBookTitle}".`
        }, token);
        if (threadRes.success) {
          finalThreadId = threadRes.data.id;
        }
      } else if (selectedThreadId !== 'none') {
        finalThreadId = selectedThreadId;
      }

      const response = await booksService.createBook({
        title: newBookTitle,
        description: newBookDescription,
        type: newBookType,
        threadId: finalThreadId
      }, token);

      if (response.success) {
        addBook(response.data);
        setNewBookTitle('');
        setNewBookDescription('');
        setNewBookType('book');
        setSelectedThreadId('new');
        toast.success(`${newBookType === 'book' ? 'Book' : 'Paper'} created successfully!`);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(`Error creating ${newBookType}: ` + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    openDialog({
      title: 'Delete Book',
      message: `Are you sure you want to delete "${title}"? This will permanently remove all chapters and pages associated with this book.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token) return;

          const response = await booksService.deleteBook(bookId, token);
          if (response.success) {
            deleteBook(bookId);
            toast.success('Book deleted successfully');
          }
        } catch (err) {
          toast.error('Failed to delete book: ' + (err as Error).message);
        }
      }
    });
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="books-admin">
      <div className="dashboard__title">
        <h2>Threaded Books</h2>
        <p>Manage your collections, manuscripts, and collaboratively authored papers.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          <div className="card dashboard__recent">
            <div className="dashboard__recent-header">
              <h3>All Books ({books.length})</h3>
            </div>
            <div className="dashboard__recent-list">
              {books.length > 0 ? (
                books.map((book) => (
                  <div key={book.id} className="dashboard__recent-item">
                    <div className="dashboard__recent-item-info">
                      <div className="dashboard__recent-item-title">{book.title}</div>
                      <div className="dashboard__recent-item-meta">
                        <span style={{ textTransform: 'capitalize' }}>Type: {book.type}</span>
                        <span className="dot" />
                        <span>{book.type === 'paper' ? 'Pages' : 'Chapters'}: {book.chapters?.length || 0}</span>
                        <span className="dot" />
                        <span style={{ textTransform: 'capitalize' }}>Status: {book.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/books/${book.id}`}>
                        <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                          View & Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', minWidth: 'unset', background: '#fff' }}
                      >
                        <i className="ph ph-trash" style={{ color: '#ff4d4f' }} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#737373' }}>
                  No books found. Create your first collection using the form on the right.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>Start New Book</h3>
            <form onSubmit={handleCreateBook} className="auth__fields">
              <div className="organization__form-group">
                <label className="label">Title</label>
                <Input 
                  placeholder="e.g. Master of Microservices" 
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  required
                />
              </div>

              <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                <label className="label">Description</label>
                <textarea 
                  className="input" 
                  placeholder="What is this collection about?"
                  style={{ height: '100px', resize: 'none', padding: '0.75rem' }}
                  value={newBookDescription}
                  onChange={(e) => setNewBookDescription(e.target.value)}
                />
              </div>

              <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                <label className="label">Type</label>
                <Select
                  value={newBookType}
                  onChange={(e) => setNewBookType(e.target.value as 'book' | 'paper')}
                  options={[
                    { value: 'book', label: 'Book (Chapters & Pages)' },
                    { value: 'paper', label: 'Paper (Single-level Pages)' }
                  ]}
                />
              </div>

              <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                <label className="label">Attach Thread</label>
                <Select
                  value={selectedThreadId}
                  onChange={(e) => setSelectedThreadId(e.target.value)}
                  options={[
                    { value: 'new', label: 'Create new thread automatically' },
                    { value: 'none', label: 'Do not attach thread' },
                    ...threads.map(t => ({ value: t.id, label: t.title || 'Untitled Thread' }))
                  ]}
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="btn--full" 
                style={{ marginTop: '1rem' }} 
                disabled={isCreating}
                loading={isCreating}
              >
                Create {newBookType === 'book' ? 'Book' : 'Paper'}
              </Button>
            </form>
          </div>

          <div className="card card--padded" style={{ marginTop: '2rem' }}>
             <h3 className="label" style={{ marginBottom: '1rem' }}>Writing Guide</h3>
             <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.5 }}>
               Books allow you to organize complex topics into structured chapters. Papers provide a simpler, flat page structure.
               <br/><br/>
               You can use <strong>AI Threads</strong> to draft content for specific pages and sync them directly to your manuscript.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
