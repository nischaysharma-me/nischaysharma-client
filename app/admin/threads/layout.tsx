'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ThreadsSidebar from '@/components/admin/ThreadsSidebar';

export default function ThreadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatOpen = pathname.split('/').length > 3; // /admin/threads/[id]

  return (
    <div className={`threads-admin ${isChatOpen ? 'threads-admin--chat-open' : ''}`}>
      <ThreadsSidebar />
      {children}
    </div>
  );
}
