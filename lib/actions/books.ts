'use server';

import { booksService, CreateBookData, Book, Page } from '@/services/books.service';

export async function getUserBooksAction(token: string, full: boolean = false) {
  try {
    return await booksService.getUserBooks(token, full);
  } catch (error) {
    console.error('Server Action Error (getUserBooks):', error);
    return { success: false, data: [], error: 'Failed to fetch books' };
  }
}

export async function getBookAction(bookId: string, token: string) {
  try {
    return await booksService.getBook(bookId, token);
  } catch (error) {
    console.error('Server Action Error (getBook):', error);
    return { success: false, error: 'Failed to fetch book' };
  }
}

export async function createBookAction(data: CreateBookData, token: string) {
  try {
    return await booksService.createBook(data, token);
  } catch (error) {
    console.error('Server Action Error (createBook):', error);
    return { success: false, error: 'Failed to create book' };
  }
}

export async function updateBookAction(bookId: string, updates: Partial<Book>, token: string) {
  try {
    return await booksService.updateBook(bookId, updates, token);
  } catch (error) {
    console.error('Server Action Error (updateBook):', error);
    return { success: false, error: 'Failed to update book' };
  }
}

export async function deleteBookAction(bookId: string, token: string) {
  try {
    return await booksService.deleteBook(bookId, token);
  } catch (error) {
    console.error('Server Action Error (deleteBook):', error);
    return { success: false, error: 'Failed to delete book' };
  }
}

export async function getBookPagesAction(bookId: string, token: string) {
  try {
    return await booksService.getBookPages(bookId, token);
  } catch (error) {
    console.error('Server Action Error (getBookPages):', error);
    return { success: false, data: [], error: 'Failed to fetch pages' };
  }
}

export async function updatePageAction(bookId: string, pageId: string, updates: Partial<Page>, token: string) {
  try {
    return await booksService.updatePage(bookId, pageId, updates, token);
  } catch (error) {
    console.error('Server Action Error (updatePage):', error);
    return { success: false, error: 'Failed to update page' };
  }
}

export async function deletePageAction(bookId: string, pageId: string, token: string) {
  try {
    return await booksService.deletePage(bookId, pageId, token);
  } catch (error) {
    console.error('Server Action Error (deletePage):', error);
    return { success: false, error: 'Failed to delete page' };
  }
}
