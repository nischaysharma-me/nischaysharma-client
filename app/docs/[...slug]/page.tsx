import React from 'react';
import { docsService, DocContent } from '@/services/docs.service';
import DocPageClient from '@/components/docs/DocPageClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join('/');
  
  try {
    const res = await docsService.getDoc(path);
    if (res.success) {
      return {
        title: `${res.data.title} | Documentation`,
        description: `Learn about ${res.data.title} in the TaughtCode documentation.`,
        alternates: {
          canonical: `/docs/${path}`,
        },
      };
    }
  } catch (err) {
    console.error('Failed to generate docs metadata:', err);
  }

  return {
    title: 'Documentation Not Found',
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join('/');
  
  let data: DocContent | null = null;
  
  try {
    const res = await docsService.getDoc(path);
    if (res.success) {
      data = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch doc:', err);
  }

  if (!data) {
    return (
      <div className="docs-content">
        <h1>Documentation Not Found</h1>
        <p>The requested document could not be found.</p>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": data.title,
    "description": `Documentation for ${data.title}`,
    "author": {
      "@type": "Person",
      "name": "Nischay Sharma"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TaughtCode"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DocPageClient data={data} slug={slug} />
    </>
  );
}
