'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useReadingModeStore } from '@/store/useReadingModeStore';
import ReadingModeToggle from '@/components/ReadingModeToggle';

export default function Header() {
  const pathname = usePathname();
  const { previousPath, setPreviousPath } = useStore();
  const readingModeEnabled = useReadingModeStore(state => state.isEnabled);

  // Don't show this header on admin pages
  if (pathname.startsWith('/admin')) return null;

  const isBillboard = pathname === '/billboard';

  const handleMenuClick = () => {
    if (!isBillboard) {
      setPreviousPath(pathname);
    }
  };

  return (
    <header className={`landing__header ${readingModeEnabled ? 'reading-mode-active' : ''}`}>
      <Link href="/" className="landing__brand">
        NISCHAY
      </Link>
      
      <div className="landing__header-left">
        <Link href="/docs" className="landing__logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
        </Link>
        
        <ReadingModeToggle />
      </div>
      
      <Link 
        href={isBillboard ? (previousPath || '/') : '/billboard'} 
        onClick={handleMenuClick}
        className="landing__menu-btn" 
        style={{ justifySelf: 'end' }}
      >
        {isBillboard ? 'Close' : 'Menu'}
      </Link>
    </header>
  );
}
