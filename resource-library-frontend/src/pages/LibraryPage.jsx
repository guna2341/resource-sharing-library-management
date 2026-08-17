import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, BookOpen, Grid, List, Plus, Sparkles,
  ArrowUpDown, Filter, X, Upload, Layers, Compass, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppSidebar } from '../components/layout/AppSidebar';
import { ResourceCard, ResourceCardSkeleton } from '../components/resources/ResourceCard';
import { ErrorState, EmptyState } from '../components/common/States';
import { getBooks } from '../api/books';
import {
  setBooks, setLoading, setError, setSearchQuery,
  selectFilteredBooks, selectBooksLoading, selectBooksError, selectSearchQuery,
} from '../features/books/booksSlice';
import { cn, fileTypeLabel, fileTypeColor, formatDate } from '../lib/utils';

export default function LibraryPage() {
  const dispatch = useDispatch();
  const allFilteredBooks = useSelector(selectFilteredBooks);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);
  const searchQuery = useSelector(selectSearchQuery);
  const totalCount = useSelector((s) => s.books.items.length);

  const [selectedFileType, setSelectedFileType] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  function load() {
    dispatch(setLoading(true));
    dispatch(setError(null));
    getBooks()
      .then((res) => {
        if (res.success) dispatch(setBooks(res.data || []));
        else dispatch(setError(res.message || 'Failed to load books.'));
      })
      .catch((err) => dispatch(setError(err.response?.data?.message || 'Unable to connect to backend server.')))
      .finally(() => dispatch(setLoading(false)));
  }

  useEffect(() => {
    load();
    dispatch(setSearchQuery(''));
  }, []);

  let displayedBooks = allFilteredBooks.filter((book) => {
    if (selectedFileType === 'ALL') return true;
    return book.fileType?.toUpperCase() === selectedFileType;
  });

  displayedBooks = [...displayedBooks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'pages') return (b.pages || 0) - (a.pages || 0);
    return 0;
  });

  const fileTypeOptions = ['ALL', 'PDF', 'DOCX', 'PPTX', 'XLSX', 'TXT'];

  const quickCategories = [
    { name: 'Computer Science', desc: 'Algorithms, OS, Cloud, Web Systems' },
    { name: 'Engineering & Math', desc: 'Calculus, Physics, Mechanics, Circuitry' },
    { name: 'Research Papers', desc: 'Peer-reviewed publications & thesis' },
    { name: 'Class Study Notes', desc: 'Midterm summaries & cheat sheets' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] w-full">
      {/* Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header Banner */}
        <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6 sticky top-0 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Resource Library
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-100/80">
                  {totalCount} available
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Browse documents, study notes, lecture slide decks, and code references.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/upload" className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20">
                <Plus size={15} />
                Upload Resource
              </Link>
            </div>
          </div>

          {/* Search and Filter Controls Toolbar */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                type="search"
                id="library-search"
                className="input-base pr-9 py-2 text-xs rounded-xl"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by title, topic, or author..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
              {searchQuery && (
                <button
                  onClick={() => dispatch(setSearchQuery(''))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Pills and View Switches */}
            <div className="flex flex-wrap items-center gap-2.5 justify-between lg:justify-end">
              {/* File Type Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {fileTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFileType(type)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all font-mono',
                      selectedFileType === type
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Sorting Select */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
                <ArrowUpDown size={13} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="pages">Most Pages</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  )}
                  title="Grid view"
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  )}
                  title="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-10 w-full flex flex-col justify-start">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : displayedBooks.length === 0 ? (
            /* Rich Empty State Showcase */
            <div className="space-y-10 py-6 max-w-5xl mx-auto w-full">
              <div className="glass-card rounded-3xl p-8 sm:p-12 text-center bg-white border border-slate-200/80 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  {searchQuery ? 'No matching resources found' : 'Your Library Catalog is Ready'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                  {searchQuery
                    ? `No resources match the search term "${searchQuery}". Try searching for another topic or resetting filters.`
                    : 'Be the first to upload reference textbooks, research papers, and class notes to share with your university peers.'}
                </p>
                <Link to="/upload" className="btn-accent text-xs px-6 py-3 shadow-md shadow-indigo-500/25">
                  <Upload size={15} /> Upload Your First Document
                </Link>
              </div>

              {/* Quick Categories Explorer */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-4">
                  Browse by Academic Discipline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickCategories.map((cat) => (
                    <div
                      key={cat.name}
                      className="glass-card rounded-2xl p-5 bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between min-h-[120px]"
                      onClick={() => dispatch(setSearchQuery(cat.name.split(' ')[0]))}
                    >
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
                          <Compass size={17} />
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {cat.name}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedBooks.map((book, i) => (
                <ResourceCard key={book.bookId} book={book} index={i} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
              {displayedBooks.map((book) => (
                <Link
                  key={book.bookId}
                  to={`/library/${book.bookId}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase', fileTypeColor(book.fileType))}>
                      {fileTypeLabel(book.fileType)}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {book.author || 'Unknown Author'} {book.pages ? `· ${book.pages} pages` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>{formatDate(book.createdAt)}</span>
                    <span className="btn-ghost text-xs px-3 py-1 bg-white">View</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
