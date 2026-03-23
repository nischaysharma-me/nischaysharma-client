'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function Header() {
  const pathname = usePathname();
  const { previousPath, setPreviousPath } = useStore();

  // Don't show this header on admin pages
  if (pathname.startsWith('/admin')) return null;

  const isBillboard = pathname === '/billboard';

  const handleMenuClick = () => {
    if (!isBillboard) {
      setPreviousPath(pathname);
    }
  };

  return (
    <header className="landing__header">
      <Link href="/" className="landing__brand">
        NISCHAY
      </Link>
      
      <Link href="/docs" className="landing__logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
      </Link>
      
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
