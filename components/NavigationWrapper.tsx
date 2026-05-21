'use client';

import React, { useEffect } from 'react';
import Header from './Header';
import BillboardOverlay from './BillboardOverlay';
import { useBillboardOverlayStore } from '@/store/useBillboardOverlayStore';

export default function NavigationWrapper() {
  const fetchBillboards = useBillboardOverlayStore(state => state.fetchBillboards);

  useEffect(() => {
    // Pre-fetch billboard data in the background for zero-latency overlay
    fetchBillboards();
  }, [fetchBillboards]);

  return (
    <>
      <Header />
      <BillboardOverlay />
    </>
  );
}
