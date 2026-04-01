import React from 'react';
import { getPostAction } from '@/lib/actions/posts';
import PostPreviewClient from '@/components/admin/PostPreviewClient';
import { notFound } from 'next/navigation';

interface PostPreviewPageProps {
  params: {
    id: string;
  };
}

export default async function PostPreviewPage({ params }: PostPreviewPageProps) {
  const { id } = await params;
  const response = await getPostAction(id);

  if (!response.success || !response.data) {
    notFound();
  }

  return <PostPreviewClient initialPost={response.data} />;
}
