'use client';

import React, { Suspense, lazy } from 'react';
import Header from './Header';
import { useBillboardOverlayStore } from '@/store/useBillboardOverlayStore';
import { useStackMenuStore } from '@/store/useStackMenuStore';

const BillboardOverlay = lazy(() => import('./BillboardOverlay'));
const StackMenu = lazy(() => import('./StackMenu'));

export default function NavigationWrapper() {
  const isBillboardOpen = useBillboardOverlayStore(state => state.isOpen);
  const isStackOpen = useStackMenuStore(state => state.isOpen);

  return (
    <>
      <Header />
      {isBillboardOpen && <Suspense fallback={null}><BillboardOverlay /></Suspense>}
      {isStackOpen && <Suspense fallback={null}><StackMenu /></Suspense>}
    </>
  );
}
