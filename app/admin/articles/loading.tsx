'use client';

import React from 'react';

export default function ArticlesLoading() {
  return (
    <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="dashboard__profile-avatar animate-pulse" style={{ width: '40px', height: '40px', borderRadius: '8px' }}></div>
      <div style={{ 
        fontSize: '10px', 
        fontWeight: 800, 
        letterSpacing: '0.4em', 
        textTransform: 'uppercase',
        opacity: 0.3
      }}>
        Loading Articles...
      </div>
    </div>
  );
}
