import React from 'react';
import BookDetailClient from '@/app/admin/books/[id]/BookDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <BookDetailClient bookId={id} />;
}
