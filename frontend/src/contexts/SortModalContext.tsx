import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type SortModalContextValue = {
  isOpen: boolean;
  openSortModal: () => void;
  closeSortModal: () => void;
};

const SortModalContext = createContext<SortModalContextValue | null>(null);

export function SortModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openSortModal = useCallback(() => setIsOpen(true), []);
  const closeSortModal = useCallback(() => setIsOpen(false), []);
  return (
    <SortModalContext.Provider value={{ isOpen, openSortModal, closeSortModal }}>
      {children}
    </SortModalContext.Provider>
  );
}

export function useSortModal() {
  const ctx = useContext(SortModalContext);
  if (!ctx) throw new Error('useSortModal must be used within SortModalProvider');
  return ctx;
}
