import React, { useContext, useState, useMemo } from 'react';
import { Search, BookOpen, Clock, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LibraryContext } from '../App';
import { BookStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { books } = useContext(LibraryContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const recentBooks = [...books].sort((a, b) => b.addedDate - a.addedDate).slice(0, 3);
  const favoriteBooks = books.filter(b => b.isFavorite);
  
  const readingCount = books.filter(b => b.status === BookStatus.Reading).length;
  const finishedCount = books.filter(b => b.status === BookStatus.Finished).length;
  const toReadCount = books.filter(b => b.status === BookStatus.ToRead).length;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return books.filter(b => 
      b.title.toLowerCase().includes(query) || 
      b.author.toLowerCase().includes(query) || 
      (b.genre && b.genre.toLowerCase().includes(query))
    ).slice(0, 5); // Limit to 5 suggestions
  }, [books, searchQuery]);

  const handleSelectBook = (bookTitle: string) => {
    navigate('/library', { state: { initialSearch: bookTitle } });
  };

  const calculateProgress = (current: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  };

  return (
    <div className="pb-24 pt-safe">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white">Trang chủ</h1>
        <p className="text-slate-400 text-sm mt-1">Chào mừng quay trở lại!</p>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-8 relative z-30">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
            placeholder="Tìm sách..." 
            className="w-full bg-card border-none rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 transition-all shadow-lg shadow-black/20"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && searchQuery && (
          <div className="absolute top-full left-6 right-6 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((book) => (
                  <li key={book.id}>
                    <button 
                      onClick={() => handleSelectBook(book.title)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <img src={book.coverUrl} alt={book.title} className="w-8 h-12 object-cover rounded" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{book.title}</p>
                        <p className="text-xs text-slate-400 truncate">{book.author}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm">
                Không tìm thấy sách phù hợp.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Favorites Section */}
      {favoriteBooks.length > 0 && (
        <section className="mb-8">
          <div className="px-6 flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              Sách yêu thích
            </h2>
            <button 
               onClick={() => navigate('/library')} 
               className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Xem tất cả
            </button>
          </div>
          
          <div className="flex overflow-x-auto px-6 gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {favoriteBooks.map(book => (
              <div 
                key={book.id} 
                onClick={() => navigate('/library', { state: { initialSearch: book.title } })}
                className="snap-center flex-shrink-0 w-64 bg-zinc-800/50 border border-white/5 rounded-2xl p-4 flex gap-4 cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-lg relative">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  {book.status === BookStatus.Reading && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                       <div className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                         <BookOpen size={14} />
                       </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="font-bold text-white line-clamp-2 leading-tight mb-1">{book.title}</h3>
                  <p className="text-xs text-slate-400 truncate mb-auto">{book.author}</p>
                  
                  {book.status === BookStatus.Reading ? (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Đã đọc</span>
                        <span className="text-emerald-400 font-bold">{calculateProgress(book.currentPage || 0, book.totalPages || 0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${calculateProgress(book.currentPage || 0, book.totalPages || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <span className={`text-[10px] px-2 py-1 rounded bg-zinc-700/50 border border-zinc-600/50 ${
                        book.status === BookStatus.Finished ? 'text-blue-400' : 'text-purple-400'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured (Static if no favorites, otherwise shown below) */}
      {favoriteBooks.length === 0 && (
        <section className="px-6 mb-8 relative z-10">
          <div className="relative overflow-hidden rounded-3xl bg-emerald-900/40 border border-emerald-800/50 p-6">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative flex items-start gap-5">
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=200&h=300" 
                alt="Featured" 
                className="w-24 h-36 object-cover rounded-lg shadow-2xl shadow-black/50 transform rotate-3"
              />
              <div className="flex flex-col justify-between h-36 py-1">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-1">The Psychology of Money</h3>
                  <p className="text-sm text-emerald-100/70">Morgan Housel</p>
                </div>
                <button className="self-start px-4 py-2 bg-white text-emerald-900 text-sm font-bold rounded-lg shadow-lg hover:bg-emerald-50 transition-colors">
                  Khám phá ngay
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="px-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          {recentBooks.map(book => (
            <div key={book.id} onClick={() => handleSelectBook(book.title)} className="flex items-center gap-4 bg-card p-3 rounded-xl border border-white/5 hover:bg-zinc-800 transition-colors cursor-pointer active:scale-[0.99]">
              <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover rounded-md" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-100 truncate">{book.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    book.status === BookStatus.Reading ? 'bg-green-500' :
                    book.status === BookStatus.Finished ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></span>
                  <p className="text-xs text-slate-500">
                    {book.status}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-6">
        <h2 className="text-lg font-bold text-white mb-4">Tổng quan</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="aspect-square bg-card rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-white/5 shadow-lg">
            <span className="text-2xl font-bold text-blue-400">{finishedCount}</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide font-medium">Đã đọc</span>
          </div>
          <div className="aspect-square bg-card rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-white/5 shadow-lg">
            <span className="text-2xl font-bold text-emerald-400">{readingCount}</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide font-medium">Đang đọc</span>
          </div>
          <div className="aspect-square bg-card rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-white/5 shadow-lg">
            <span className="text-2xl font-bold text-purple-400">{toReadCount}</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide font-medium">Muốn đọc</span>
          </div>
        </div>
      </section>
    </div>
  );
};