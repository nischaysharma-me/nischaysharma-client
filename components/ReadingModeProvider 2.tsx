'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useReadingModeStore } from '@/store/useReadingModeStore';

const STORAGE_KEY = 'readingMode';

interface ReadingModeContextType {
  isEnabled: boolean;
  isSepiaEnabled: boolean;
  toggleReadingMode: () => void;
  toggleSepia: () => void;
}

const ReadingModeContext = createContext<ReadingModeContextType | undefined>(undefined);

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isEnabled, isSepiaEnabled, toggleReadingMode, toggleSepia, setIsEnabled, setIsSepiaEnabled } = useReadingModeStore();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { isEnabled: savedEnabled, isSepiaEnabled: savedSepia } = JSON.parse(saved);
        setIsEnabled(savedEnabled);
        setIsSepiaEnabled(savedSepia);
      } catch (e) {
        console.error('Failed to parse reading mode settings:', e);
      }
    }
    setIsLoaded(true);
  }, [setIsEnabled, setIsSepiaEnabled]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isEnabled, isSepiaEnabled }));
    }
  }, [isEnabled, isSepiaEnabled, isLoaded]);

  return (
    <ReadingModeContext.Provider
      value={{
        isEnabled,
        isSepiaEnabled,
        toggleReadingMode,
        toggleSepia,
      }}
    >
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (context === undefined) {
    throw new Error('useReadingMode must be used within a ReadingModeProvider');
  }
  return context;
}
