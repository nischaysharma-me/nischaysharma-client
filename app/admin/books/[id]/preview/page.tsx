import React from 'react';
import BookPreviewClient from './BookPreviewClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPreviewPage({ params }: PageProps) {
  const { id } = await params;

  return <BookPreviewClient bookId={id} />;
}
