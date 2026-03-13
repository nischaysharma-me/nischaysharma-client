'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Book, booksService } from '@/services/books.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AdminLoading from '@/app/admin/loading';
import { useBookStore } from '@/store/admin/useBookStore';
import { toast } from 'sonner';

interface BooksClientProps {
  initialBooks: Book[];
}

export default function BooksClient({ initialBooks }: BooksClientProps) {
  const { books, setBooks, addBook, setLoading, loading } = useBookStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');

  // Hydrate store on mount
  useEffect(() => {
    fetchBooks();
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

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await booksService.createBook({
        title: newBookTitle,
        description: newBookDescription,
        type: 'book'
      }, token);

      if (response.success) {
        addBook(response.data);
        setNewBookTitle('');
        setNewBookDescription('');
        toast.success('Book created successfully!');
      }
    } catch (err: any) {
      toast.error('Error creating book: ' + err.message);
    } finally {
      setIsCreating(false);
    }
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
                        <span>Type: {book.type}</span>
                        <span className="dot" />
                        <span>Chapters: {book.chapters?.length || 0}</span>
                        <span className="dot" />
                        <span>Status: {book.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/books/${book.id}`}>
                        <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                          View & Edit
                        </Button>
                      </Link>
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
                <label className="label">Book Title</label>
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

              <Button 
                type="submit" 
                variant="primary" 
                className="btn--full" 
                style={{ marginTop: '1rem' }} 
                disabled={isCreating}
                loading={isCreating}
              >
                Create Book
              </Button>
            </form>
          </div>

          <div className="card card--padded" style={{ marginTop: '2rem' }}>
             <h3 className="label" style={{ marginBottom: '1rem' }}>Writing Guide</h3>
             <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.5 }}>
               Books allow you to organize complex topics into structured chapters. 
               <br/><br/>
               You can use <strong>AI Threads</strong> to draft content for specific pages and sync them directly to your book's manuscript.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
