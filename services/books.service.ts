import { apiFetch } from './apiClient';

export interface Chapter {
  id: string;
  title: string;
  pageIds: string[];
}

export interface Book {
  id: string;
  userId: string;
  threadId: string | null;
  title: string;
  description: string;
  coverImage: string;
  status: 'draft' | 'published';
  type: 'book' | 'paper';
  chapters: Chapter[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  bookId: string;
  chapterId: string;
  content: string;
  images: string[];
  status: 'draft' | 'published';
  lastDraftedFromMessageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookData {
  title: string;
  description?: string;
  threadId?: string;
  type?: 'book' | 'paper';
}

export const booksService = {
  /**
   * List all books for the authenticated user
   */
  getUserBooks: (token: string, full: boolean = false) => {
    const query = full ? '?full=true' : '';
    return apiFetch<{ success: boolean; data: Book[] | (Book & { chapters: (Chapter & { pages: Page[] })[]; pages?: Page[] })[] }>(`/books${query}`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Get a specific book by ID
   */
  getBook: (bookId: string, token: string) => {
    return apiFetch<{ success: boolean; data: Book }>(`/books/${bookId}`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Get a book with full hierarchy (chapters and pages populated)
   */
  getFullBook: (bookId: string, token: string) => {
    return apiFetch<{ success: boolean; data: Book & { chapters: (Chapter & { pages: Page[] })[]; pages?: Page[] } }>(`/books/${bookId}/full`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Create a new book or paper
   */
  createBook: (data: CreateBookData, token: string) => {
    return apiFetch<{ success: boolean; data: Book }>('/books', {
      method: 'POST',
      token,
      body: data,
    });
  },

  /**
   * Update book metadata (title, description, status, etc.)
   */
  updateBook: (bookId: string, updates: Partial<Book>, token: string) => {
    return apiFetch<{ success: boolean; data: Book }>(`/books/${bookId}`, {
      method: 'PATCH',
      token,
      body: updates,
    });
  },

  /**
   * Delete a book and all its associated pages
   */
  deleteBook: (bookId: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/books/${bookId}`, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Get all pages for a specific book (ordered by creation)
   */
  getBookPages: (bookId: string, token: string) => {
    return apiFetch<{ success: boolean; data: Page[] }>(`/books/${bookId}/pages`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Update a specific page's content or status
   */
  updatePage: (bookId: string, pageId: string, updates: Partial<Page>, token: string) => {
    return apiFetch<{ success: boolean; data: Page }>(`/books/${bookId}/pages/${pageId}`, {
      method: 'PATCH',
      token,
      body: updates,
    });
  },

  /**
   * Delete a specific page from a book
   */
  deletePage: (bookId: string, pageId: string, token: string) => {
    return apiFetch<{ success: boolean; message: string }>(`/books/${bookId}/pages/${pageId}`, {
      method: 'DELETE',
      token,
    });
  }
};
