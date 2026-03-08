import React from 'react';
import { cookies } from 'next/headers';
import BooksClient from '@/components/admin/BooksClient';
import { getUserBooksAction } from '@/actions/books';

export default async function BooksPage() {
  const cookieStore = await cookies();
  // In a real scenario, we'd get the token from cookies or pass it from a middleware-verified session.
  // For now, we'll let the client-side component fetch using the Firebase SDK token on mount 
  // OR we use a placeholder and let the store hydrate.
  
  // To keep it consistent with other pages that might use server actions:
  // Note: Server actions need a token which we usually get on the client.
  // So we pass initial empty and let the client fetch.
  
  return <BooksClient initialBooks={[]} />;
}
