'use client';

import React from 'react';
import { DocContent } from '@/services/docs.service';
import Markdown from '@/components/ui/Markdown';

interface DocPageClientProps {
  data: DocContent;
  slug: string | string[];
}

export default function DocPageClient({ data, slug }: DocPageClientProps) {
  return (
    <article className="docs-content">
      <header style={{ marginBottom: '4rem' }}>
         <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#a3a3a3', display: 'block', marginBottom: '1rem' }}>
           Documentation / {Array.isArray(slug) ? slug[0] : ''}
         </span>
         <h1>{data?.title}</h1>
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
