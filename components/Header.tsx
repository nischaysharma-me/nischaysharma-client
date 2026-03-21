'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function Header() {
  const pathname = usePathname();
  const { isMenuOpen, toggleMenu } = useStore();

  // Don't show this header on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="landing__header" style={{ position: 'fixed', zIndex: 1000, width: '90%', left: '50%', transform: 'translateX(-50%)', top: '1.5rem' }}>
      <Link href="/" className="landing__brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        NISCHAY SHARMA
      </Link>
      
      <div className="landing__logo">
        <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
      </div>
      
      <button onClick={toggleMenu} className="landing__menu-btn">
        {isMenuOpen ? 'Close' : 'Menu'}
      </button>
    </header>
  );
}
