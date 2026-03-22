'use client';

import React, { useEffect, useState } from 'react';
import { docsService, DocContent } from '@/services/docs.service';
import AdminLoading from '@/app/admin/loading';

export default function DocsIndex() {
  const [data, setData] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const res = await docsService.getDoc('');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch docs index:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndex();
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <div className="docs-content" dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
  );
}
