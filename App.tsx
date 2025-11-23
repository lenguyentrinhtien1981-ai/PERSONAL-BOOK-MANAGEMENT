import React, { createContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { ReviewBook } from './components/ReviewBook';
import { Library } from './components/Library';
import { Statistics } from './components/Statistics';
import { BottomNav } from './components/BottomNav';
import { Book, BookStatus } from './types';
import { INITIAL_BOOKS } from './constants';

interface LibraryContextType {
  books: Book[];
  addBook: (bookData: Omit<Book, 'id' | 'addedDate'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
}

export const LibraryContext = createContext<LibraryContextType>({
  books: [],
  addBook: () => {},
  updateBook: () => {},
  deleteBook: () => {},
});

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-darker min-h-screen text-slate-200 selection:bg-emerald-500 selection:text-white">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/review" element={<ReviewBook />} />
        <Route path="/library" element={<Library />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('shelfscan_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  useEffect(() => {
    localStorage.setItem('shelfscan_books', JSON.stringify(books));
  }, [books]);

  const addBook = (bookData: Omit<Book, 'id' | 'addedDate'>) => {
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      addedDate: Date.now(),
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  return (
    <LibraryContext.Provider value={{ books, addBook, updateBook, deleteBook }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </LibraryContext.Provider>
  );
};

export default App;