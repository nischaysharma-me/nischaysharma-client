'use client';

import React, { useEffect, useState } from 'react';
import { docsService, DocSection } from '@/services/docs.service';
import DocsSidebar from '@/components/docs/DocsSidebar';
import AdminLoading from '@/app/admin/loading';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [navigation, setNavigation] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await docsService.getNavigation();
        if (res.success) {
          setNavigation(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch docs navigation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNav();
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <div className="docs-layout">
      <div className="docs-layout__container">
        <DocsSidebar navigation={navigation} />
        <main className="docs-layout__main">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .docs-layout {
          min-height: 100vh;
          background: #fff;
          padding-top: 80px; // Space for the centered fixed header
        }

        .docs-layout__container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
        }

        .docs-layout__main {
          flex: 1;
          padding: 4rem 6rem;
          max-width: 900px;
        }

        /* Documentation Content Styles */
        .docs-content {
          font-family: var(--font-sans, sans-serif);
          line-height: 1.7;
          color: #333;
        }

        .docs-content h1 {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 2.5rem;
          line-height: 1.1;
        }

        .docs-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 4rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.75rem;
        }

        .docs-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .docs-content p {
          margin-bottom: 1.5rem;
        }

        .docs-content ul, .docs-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .docs-content li {
          margin-bottom: 0.5rem;
        }

        .docs-content code {
          background: #f5f5f5;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        .docs-content pre {
          background: #111;
          color: #eee;
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 2rem;
        }

        .docs-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }

        @media (max-width: 768px) {
          .docs-layout__main {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
