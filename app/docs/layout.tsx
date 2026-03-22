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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      <button 
        className={`docs-sidebar-toggle ${isSidebarCollapsed ? 'is-collapsed' : ''}`}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
      >
        <i className={`ph ${isSidebarCollapsed ? 'ph-list' : 'ph-caret-left'}`} />
      </button>

      <div className={`docs-layout__container ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
        <div className="docs-layout__sidebar-wrapper">
          <DocsSidebar navigation={navigation} />
        </div>
        <main className="docs-layout__main">
          <div className="docs-layout__content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
