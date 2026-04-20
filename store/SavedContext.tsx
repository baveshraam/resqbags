import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SavedContextType {
  savedIds: string[];
  toggleSaved: (bagId: string) => void;
  isSaved: (bagId: string) => boolean;
}

const SavedContext = createContext<SavedContextType | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSaved = (bagId: string) => {
    setSavedIds(prev =>
      prev.includes(bagId) ? prev.filter(id => id !== bagId) : [...prev, bagId]
    );
  };

  const isSaved = (bagId: string) => savedIds.includes(bagId);

  return (
    <SavedContext.Provider value={{ savedIds, toggleSaved, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within SavedProvider');
  return ctx;
}
