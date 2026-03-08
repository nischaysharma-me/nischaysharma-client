import { create } from 'zustand';
import { Book } from '@/services/books.service';

interface BookState {
  books: Book[];
  loading: boolean;
  
  // Actions
  setBooks: (books: Book[]) => void;
  setLoading: (loading: boolean) => void;
  addBook: (book: Book) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  deleteBook: (bookId: string) => void;
}

export const useBookStore = create<BookState>((set) => ({
  books: [],
  loading: true,

  setBooks: (books) => set({ books }),
  setLoading: (loading) => set({ loading }),
  addBook: (book) => set((state) => ({ 
    books: [book, ...state.books] 
  })),
  updateBook: (bookId, updates) => set((state) => ({
    books: state.books.map(b => b.id === bookId ? { ...b, ...updates } : b)
  })),
  deleteBook: (bookId) => set((state) => ({
    books: state.books.filter(b => b.id !== bookId)
  })),
}));
