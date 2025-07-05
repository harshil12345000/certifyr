import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const BOOKMARKS_KEY = 'certifyr_template_bookmarks';

interface BookmarksContextType {
  bookmarks: string[];
  addBookmark: (id: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback((id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b !== id));
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
};

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
} 