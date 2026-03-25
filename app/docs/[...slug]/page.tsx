'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { docsService, DocContent } from '@/services/docs.service';
import AdminLoading from '@/app/admin/loading';
import Markdown from '@/components/ui/Markdown';

export default function DocPage() {
  const { slug } = useParams();
  const [data, setData] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoc = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // slug is an array of path segments
        const path = Array.isArray(slug) ? slug.join('/') : slug;
        const res = await docsService.getDoc(path);
        
        if (res.success) {
          setData(res.data);
          // Set page title
          document.title = `${res.data.title} | TaughtCode Documentation`;
        } else {
          setError('Documentation not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch doc:', err);
        setError(err.message || 'Failed to load documentation');
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [slug]);

  if (loading) return <AdminLoading />;
  
  if (error) {
    return (
      <div className="docs-content">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <article className="docs-content">
      <header style={{ marginBottom: '4rem' }}>
         <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#a3a3a3', display: 'block', marginBottom: '1rem' }}>
           Documentation / {Array.isArray(slug) ? slug[0] : ''}
         </span>
         {/* <h1>{data?.title}</h1> */}
      </header>
      
      {data?.markdown ? (
        <Markdown content={data.markdown} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
      )}
      
      <footer style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
         <p style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
           Last updated: {new Date().toLocaleDateString()}
         </p>
      </footer>
    </article>
  );
}
