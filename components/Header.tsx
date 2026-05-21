'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReadingModeStore } from '@/store/useReadingModeStore';
import { useBillboardOverlayStore } from '@/store/useBillboardOverlayStore';
import ReadingModeToggle from '@/components/ReadingModeToggle';

export default function Header() {
  const pathname = usePathname();
  const readingModeEnabled = useReadingModeStore(state => state.isEnabled);
  const { isOpen, toggle } = useBillboardOverlayStore();

  // Don't show this header on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className={`landing__header ${readingModeEnabled ? 'reading-mode-active' : ''}`}>
      <Link href="/" className="landing__brand">
        NISCHAY
      </Link>
      
      <div className="landing__header-left">
        <Link href="/docs" className="landing__logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
        </Link>
        
        <div style={{ display: 'none' }}>
          <ReadingModeToggle />
        </div>
      </div>
      
      <button 
        onClick={toggle}
        className="landing__menu-btn" 
        style={{ justifySelf: 'end', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>
    </header>
  );
}
