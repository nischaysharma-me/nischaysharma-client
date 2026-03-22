'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { docsService, DocSection } from '@/services/docs.service';
import DocsSidebar from '@/components/docs/DocsSidebar';
import AdminLoading from '@/app/admin/loading';
import mermaid from 'mermaid';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [navigation, setNavigation] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await docsService.getNavigation();
        if (res.success && res.data.navigation) {
          setNavigation(res.data.navigation);
        }
      } catch (err) {
        console.error('Failed to fetch docs navigation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNav();
  }, []);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#000',
        primaryTextColor: '#fff',
        primaryBorderColor: '#000',
        lineColor: '#333',
        secondaryColor: '#f5f5f5',
        tertiaryColor: '#fff'
      }
    });
    
    // Use a small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      mermaid.contentLoaded();
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [pathname, loading]);

  if (loading) return <AdminLoading />;

  return (
    <div className="docs-layout">
      <div className="docs-layout__container">
        <DocsSidebar navigation={navigation} />
        <main className="docs-layout__main">
          <div className="docs-layout__content-wrapper">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .docs-layout {
          min-height: 100vh;
          background: #fff;
          padding-top: 100px; 
        }

        .docs-layout__container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 4rem;
          padding: 0 2rem;
        }

        .docs-layout__main {
          flex: 1;
          min-width: 0; // Prevent content from breaking flexbox
        }

        .docs-layout__content-wrapper {
          max-width: 800px;
          padding-bottom: 10rem;
        }

        /* Sidebar Custom Scrollbar */
        .docs-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .docs-sidebar::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 2px;
        }

        /* Documentation Content Styles */
        .docs-content {
          font-family: var(--font-sans, sans-serif);
          line-height: 1.8;
          color: #1a1a1a;
        }

        .docs-content h1 {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 4rem;
          line-height: 0.95;
          text-transform: uppercase;
        }

        .docs-content h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-top: 5rem;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #000;
          padding-bottom: 1rem;
          display: inline-block;
        }

        .docs-content h3 {
          font-size: 1.125rem;
          font-weight: 800;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .docs-content p {
          margin-bottom: 2rem;
          font-size: 1.1rem;
          color: #444;
        }

        .docs-content ul, .docs-content ol {
          margin-bottom: 2rem;
          padding-left: 1.25rem;
        }

        .docs-content li {
          margin-bottom: 0.75rem;
        }

        .docs-content code:not(pre code) {
          background: #f8f8f8;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
          color: #d11141;
        }

        .docs-content pre {
          background: #000;
          color: #fff;
          padding: 2rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 3rem 0;
          font-size: 0.9rem;
        }

        .docs-content blockquote {
          margin: 4rem 0;
          padding: 2rem;
          background: #fcfcfc;
          border-left: 4px solid #000;
          font-style: italic;
          color: #555;
        }

        /* Mermaid Diagram Styling */
        .mermaid {
          background: #fff !important;
          margin: 4rem 0;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 1024px) {
           .docs-layout__container {
             gap: 2rem;
           }
        }

        @media (max-width: 768px) {
          .docs-layout__main {
            padding: 0;
          }
          .docs-layout__container {
            flex-direction: column;
            padding: 0 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
