import React, { useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Edit2, Check, ChevronDown } from 'lucide-react';
import { LibraryContext } from '../App';
import { BookStatus, ScannedData } from '../types';

export const ReviewBook: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addBook, books } = useContext(LibraryContext);
  const { image, analysis } = state as { image: string; analysis: ScannedData };

  const [title, setTitle] = useState(analysis?.title || '');
  const [author, setAuthor] = useState(analysis?.author || '');
  const [genre, setGenre] = useState(analysis?.genre || '');
  const [status, setStatus] = useState<BookStatus>(BookStatus.ToRead);
  const [notes, setNotes] = useState(analysis?.description || '');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Get unique genres from existing books for the autocomplete dropdown
  const existingGenres = useMemo(() => {
    const genres = new Set<string>();
    books.forEach(book => {
      if (book.genre) genres.add(book.genre);
    });
    return Array.from(genres).sort();
  }, [books]);

  const filteredGenres = useMemo(() => {
    return existingGenres.filter(g => 
      g.toLowerCase().includes(genre.toLowerCase())
    );
  }, [existingGenres, genre]);

  const handleSave = () => {
    addBook({
      title,
      author,
      coverUrl: image,
      status,
      notes,
      genre: genre || 'Chung'
    });
    navigate('/library');
  };

  return (
    <div className="min-h-screen bg-darker pb-safe">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between bg-darker sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">Xem lại thông tin</h1>
        <button className="p-2 text-slate-400 hover:text-white">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main className="p-6 space-y-8">
        {/* Cover Image */}
        <div className="flex justify-center">
          <div className="relative w-48 shadow-2xl shadow-black/50">
            <img 
              src={image} 
              alt="Book Cover" 
              className="w-full aspect-[2/3] object-cover rounded-xl"
            />
            <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-400 transition-colors">
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tên sách</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-card border border-zinc-700 text-white text-lg font-semibold rounded-xl p-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tác giả</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-card border border-zinc-700 text-white rounded-xl p-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Thể loại</label>
            <div className="relative">
              <input 
                type="text" 
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  setShowGenreDropdown(true);
                }}
                onFocus={() => setShowGenreDropdown(true)}
                onBlur={() => setTimeout(() => setShowGenreDropdown(false), 200)}
                placeholder="ví dụ: Tài chính, Viễn tưởng"
                className="w-full bg-card border border-zinc-700 text-white rounded-xl p-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all pr-12"
              />
              <button 
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <ChevronDown size={20} />
              </button>
              
              {showGenreDropdown && filteredGenres.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                  {filteredGenres.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGenre(g);
                        setShowGenreDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-slate-200 hover:bg-zinc-700 hover:text-emerald-400 transition-colors border-b border-white/5 last:border-0 flex justify-between items-center"
                    >
                      <span>{g}</span>
                      {genre === g && <Check size={16} className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng thái</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(BookStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    status === s 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                      : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ghi chú</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-card border border-zinc-700 text-slate-200 rounded-xl p-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
              placeholder="Thêm ghi chú của bạn..."
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-emerald-900/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check size={24} strokeWidth={3} />
            Thêm vào thư viện
          </button>
        </div>
      </main>
    </div>
  );
};