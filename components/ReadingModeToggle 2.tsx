'use client';

import React from 'react';
import { useReadingMode } from '@/components/ReadingModeProvider';
import { useReadingModeStore } from '@/store/useReadingModeStore';

export default function ReadingModeToggle() {
  const { isEnabled, toggleReadingMode, toggleSepia, isSepiaEnabled } = useReadingModeStore();

  return (
    <div className="reading-mode-toggle">
      <button
        onClick={toggleReadingMode}
        className={`reading-mode-toggle__btn ${isEnabled ? 'active' : ''}`}
        title={isEnabled ? 'Disable Reading Mode' : 'Enable Reading Mode'}
      >
        <i className={`ph ${isEnabled ? 'ph-eye' : 'ph-eye-slash'}`} />
      </button>
      
      {isEnabled && (
        <button
          onClick={toggleSepia}
          className={`reading-mode-toggle__sepia ${isSepiaEnabled ? 'active' : ''}`}
          title={isSepiaEnabled ? 'Disable Sepia Tone' : 'Enable Sepia Tone'}
        >
          <i className={`ph ${isSepiaEnabled ? 'ph-sun-dim' : 'ph-sun-dim-light'}`} />
        </button>
      )}
    </div>
  );
}
