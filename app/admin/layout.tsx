'use client';

import React, { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { primaryNavItems, secondaryNavItems } from '@/config/adminNav';
import { useStore } from '@/store/useStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, activeAdminTab, setActiveAdminTab } = useStore();
  const [loading, setLoading] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser]);

  // Sync active tab with pathname
  useEffect(() => {
    const activeItem = [...primaryNavItems, ...secondaryNavItems].find(item => item.href === pathname);
    if (activeItem) {
      setActiveAdminTab(activeItem.name);
    }
    setIsSidebarOpen(false);
  }, [pathname, setActiveAdminTab]);

  if (loading) return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActive = (href: string) => pathname === href;

  return (
    <div className="dashboard">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`dashboard__sidebar-overlay ${isSidebarOpen ? 'dashboard__sidebar-overlay--open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* --- Sidebar --- */}
      <aside 
        className={`dashboard__sidebar ${isSidebarOpen ? 'dashboard__sidebar--open' : ''}`}
        data-lenis-prevent
      >
        <div className="dashboard__logo">
          <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>TaughtCode<span>.</span></h1>
          </Link>
          <button className="dashboard__sidebar-close" onClick={() => setIsSidebarOpen(false)}>
            <i className="ph ph-x" style={{ fontSize: '1.5rem' }} />
          </button>
        </div>

        <nav className="dashboard__nav" data-lenis-prevent>
          {primaryNavItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className={`dashboard__nav-item ${isActive(item.href) ? 'dashboard__nav-item--active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          <div className="dashboard__nav-divider"></div>
          
          {secondaryNavItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className={`dashboard__nav-item ${isActive(item.href) ? 'dashboard__nav-item--active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="dashboard__profile">
          <div className="dashboard__profile-info">
            <div className="dashboard__profile-avatar">
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
            <div className="dashboard__profile-text">
              <div className="name">{user?.displayName || 'Administrator'}</div>
              <div className="email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn--ghost btn--full" onClick={() => signOut(auth)}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="dashboard__main">
        <header className="dashboard__header">
          <button className="dashboard__menu-toggle" onClick={() => setIsSidebarOpen(true)}>
            <i className="ph ph-list" style={{ fontSize: '1.5rem' }} />
          </button>
          
          <div className="dashboard__header-actions">
            <Link href="/" className="btn btn--secondary">
              <i className="ph ph-arrow-square-out" />
              <span>View Site</span>
            </Link>
            <Link href="/admin/articles/create" className="btn btn--primary">
              <i className="ph ph-plus" />
              <span>New Draft</span>
            </Link>
          </div>
        </header>

        <div 
          className={`dashboard__content ${pathname.startsWith('/admin/threads') ? '' : 'dashboard__content--scrollable'}`}
          data-lenis-prevent={pathname.startsWith('/admin/threads') ? undefined : "true"}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
