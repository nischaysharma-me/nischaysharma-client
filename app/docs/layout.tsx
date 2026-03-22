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

  // Handle mobile initial state and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse on navigation for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  }, [pathname]);

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
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Poppins, system-ui, sans-serif',
      themeVariables: {
        primaryColor: '#1a1a1a',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#ffffff',
        lineColor: '#ffffff',
        secondaryColor: '#222222',
        tertiaryColor: '#1a1a1a',
        fontSize: '10px',
        mainBkg: '#000000',
        nodeBorder: '#ffffff',
        clusterBkg: '#0a0a0a',
        clusterBorder: '#333',
        titleColor: '#ffffff',
        edgeLabelBackground: '#000000'
        },
        flowchart: {
        curve: 'basis',
        padding: 15,
        useMaxWidth: true,
        htmlLabels: true
        },
        sequence: {
        actorMargin: 40,
        mirrorActors: false,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false
        },
        er: {
        useMaxWidth: true,
        layoutDirection: 'TB',
        minEntityWidth: 80,
        minEntityHeight: 60
        }
        });

    
    // Use a small delay to ensure DOM is ready and styles are applied
    const timeout = setTimeout(() => {
      mermaid.contentLoaded();
    }, 300);
    
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
