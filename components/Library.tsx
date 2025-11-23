import React, { useState, useContext, useEffect } from 'react';
import { Search, MoreVertical, Grid, List as ListIcon, X, Trash2, AlertTriangle, Calendar, BookOpen, Tag, Save, Edit3, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LibraryContext } from '../App';
import { BookStatus, Book } from '../types';

export const Library: React.FC = () => {
  const { books, deleteBook, updateBook } = useContext(LibraryContext);
  const location = useLocation();
  
  const [filter, setFilter] = useState<BookStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(location.state?.initialSearch || '');
  const [isSearchOpen, setIsSearchOpen] = useState(!!location.state?.initialSearch);
  
  // Modal States
  const [bookToDelete, setBookToDelete] = useState<{id: string, title: string} | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Edit States for Modal
  const [editStatus, setEditStatus] = useState<BookStatus>(BookStatus.ToRead);
  const [editCurrentPage, setEditCurrentPage] = useState<number | string>('');
  const [editTotalPages, setEditTotalPages] = useState<number | string>('');
  const [editNotes, setEditNotes] = useState('');
  const [editIsFavorite, setEditIsFavorite] = useState(false);

  // Sync state when selectedBook changes
  useEffect(() => {
    if (selectedBook) {
      setEditStatus(selectedBook.status);
      setEditCurrentPage(selectedBook.currentPage || 0);
      setEditTotalPages(selectedBook.totalPages || 0);
      setEditNotes(selectedBook.notes || '');
      setEditIsFavorite(!!selectedBook.isFavorite);
    }
  }, [selectedBook]);

  const filteredBooks = books.filter(book => {
    const matchesStatus = filter === 'All' ? true : book.status === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      book.title.toLowerCase().includes(query) || 
      book.author.toLowerCase().includes(query) || 
      (book.genre && book.genre.toLowerCase().includes(query));
    
    return matchesStatus && matchesSearch;
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation(); // Prevent opening details when clicking delete
    setBookToDelete({ id, title });
  };

  const handleToggleFavorite = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    updateBook(book.id, { isFavorite: !book.isFavorite });
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
      setBookToDelete(null);
      if (selectedBook?.id === bookToDelete.id) {
        setSelectedBook(null);
      }
    }
  };

  const handleSaveChanges = () => {
    if (selectedBook) {
      updateBook(selectedBook.id, {
        status: editStatus,
        currentPage: Number(editCurrentPage),
        totalPages: Number(editTotalPages),
        notes: editNotes,
        isFavorite: editIsFavorite
      });
      setSelectedBook(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    const current = Number(editCurrentPage) || 0;
    const total = Number(editTotalPages) || 1;
    if (total === 0) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  };

  const StatusBadge = ({ status, large = false }: { status: BookStatus, large?: boolean }) => {
    let color = 'bg-slate-500';
    let textColor = 'text-white';
    
    if (status === BookStatus.Reading) { color = 'bg-green-500'; }
    else if (status === BookStatus.Finished) { color = 'bg-blue-500'; }
    else if (status === BookStatus.ToRead) { color = 'bg-purple-500'; }

    if (large) {
       return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${color} ${textColor} bg-opacity-20 border border-${color}/30`}>
          {status}
        </span>
       );
    }

    return (
      <span className={`absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold text-white rounded-md shadow-sm backdrop-blur-sm ${color} bg-opacity-90`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen pb-24 pt-safe relative">
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-darker/80 backdrop-blur-md z-10 h-16">
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên sách..."
                className="w-full bg-zinc-800 border-none rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-2 rounded-full hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white">Thư viện</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors"
              >
                <Search size={24} />
              </button>
              <button className="p-2 rounded-full hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors">
                <MoreVertical size={24} />
              </button>
            </div>
          </>
        )}
      </header>

      <div className="px-4 py-2 flex justify-between items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 flex-1">
          {['All', ...Object.values(BookStatus)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'All' ? 'Tất cả' : f}
            </button>
          ))}
        </div>
        <div className="flex bg-zinc-800 rounded-lg p-1 ml-2 flex-shrink-0">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-zinc-600 text-white' : 'text-slate-400'}`}
          >
            <Grid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-zinc-600 text-white' : 'text-slate-400'}`}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      <main className="px-3 mt-2">
        {filteredBooks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <Search size={48} className="mb-4 opacity-20" />
             <p>Không tìm thấy sách nào.</p>
           </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-2">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                className="group cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelectedBook(book)}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 shadow-lg">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <StatusBadge status={book.status} />
                  
                  {/* Progress Bar for Grid */}
                  {book.status === BookStatus.Reading && book.totalPages && book.totalPages > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100))}%` }}
                      ></div>
                    </div>
                  )}

                  <button 
                    onClick={(e) => handleDeleteClick(e, book.id, book.title)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500/90 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  >
                    <Trash2 size={10} />
                  </button>

                  <button 
                    onClick={(e) => handleToggleFavorite(e, book)}
                    className="absolute bottom-1 right-1 p-1 bg-black/40 backdrop-blur-sm rounded-full text-white transition-all z-10"
                  >
                    <Star size={10} className={book.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white opacity-70"} />
                  </button>
                </div>
                <div className="mt-1.5">
                  <h3 className="font-semibold text-xs text-white truncate">{book.title}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 truncate flex-1">{book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                className="flex gap-4 bg-card p-3 rounded-xl border border-zinc-800/50 group cursor-pointer active:bg-zinc-800 transition-colors active:scale-[0.99]"
                onClick={() => setSelectedBook(book)}
              >
                <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white truncate pr-2">{book.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      book.status === BookStatus.Reading ? 'bg-green-500/20 text-green-400' :
                      book.status === BookStatus.Finished ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{book.author}</p>
                  
                  {/* Progress Text for List */}
                  {book.status === BookStatus.Reading && book.totalPages && book.totalPages > 0 && (
                     <p className="text-xs text-emerald-400 mt-1">
                       Đã đọc {Math.round(((book.currentPage || 0) / book.totalPages) * 100)}% ({book.currentPage}/{book.totalPages})
                     </p>
                  )}

                  <div className="flex items-center gap-2 mt-auto">
                    {book.genre && (
                      <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                        {book.genre}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                    <button 
                      onClick={(e) => handleToggleFavorite(e, book)}
                      className="p-1.5 rounded-full hover:bg-zinc-700 transition-colors"
                    >
                      <Star size={18} className={book.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-500"} />
                    </button>
                   <button 
                      onClick={(e) => handleDeleteClick(e, book.id, book.title)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xóa sách?</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa <br/>
                  <span className="text-white font-medium">"{bookToDelete.title}"</span>?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setBookToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Update Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-card border-t sm:border border-zinc-800 sm:rounded-3xl rounded-t-3xl w-full max-w-md shadow-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-zinc-700/50"></div>
            </div>

            {/* Cover Section */}
            <div className="relative px-6 pt-4 pb-0 flex gap-4 items-start">
               <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                 <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0 pt-1">
                 <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white leading-tight line-clamp-2 pr-2">{selectedBook.title}</h2>
                    <button 
                      onClick={() => setEditIsFavorite(!editIsFavorite)}
                      className="p-1 rounded-full hover:bg-zinc-800 transition-colors flex-shrink-0"
                    >
                      <Star size={24} className={editIsFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-500"} />
                    </button>
                 </div>
                 <p className="text-slate-400 font-medium mt-1 truncate">{selectedBook.author}</p>
                 <div className="flex items-center gap-2 mt-2">
                    {selectedBook.genre && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedBook.genre}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-zinc-800">
                       {formatDate(selectedBook.addedDate)}
                    </span>
                 </div>
               </div>
               <button 
                  onClick={() => setSelectedBook(null)}
                  className="p-2 bg-zinc-800 rounded-full text-slate-400 hover:text-white transition-colors absolute top-4 right-4"
               >
                 <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
                <div className="bg-zinc-800/50 p-1 rounded-xl flex">
                  {Object.values(BookStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditStatus(status)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        editStatus === status 
                          ? 'bg-card text-white shadow-md border border-zinc-700' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Progress */}
              <div className="space-y-3">
                 <div className="flex justify-between items-baseline">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến độ đọc</label>
                    <span className="text-xs font-bold text-emerald-400">{calculateProgress()}%</span>
                 </div>
                 
                 {/* Progress Bar Visual */}
                 <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                 </div>

                 <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                       <span className="text-[10px] text-slate-400 ml-1">Trang hiện tại</span>
                       <input 
                         type="number" 
                         value={editCurrentPage}
                         onChange={(e) => setEditCurrentPage(e.target.value)}
                         placeholder="0"
                         className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                       />
                    </div>
                    <div className="flex items-end pb-4 text-slate-500">/</div>
                    <div className="flex-1 space-y-1">
                       <span className="text-[10px] text-slate-400 ml-1">Tổng số trang</span>
                       <input 
                         type="number" 
                         value={editTotalPages}
                         onChange={(e) => setEditTotalPages(e.target.value)}
                         placeholder="?"
                         className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                       />
                    </div>
                 </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <Edit3 size={14} className="text-slate-500"/>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú cá nhân</label>
                </div>
                <textarea 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none placeholder-slate-600"
                  placeholder="Viết cảm nghĩ hoặc ghi chú của bạn về sách này..."
                />
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-2 border-t border-zinc-800 bg-card sm:rounded-b-3xl">
              <button 
                onClick={handleSaveChanges}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};