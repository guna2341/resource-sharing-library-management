import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, BookOpen, Grid, List, Table as TableIcon,
  Plus, Sparkles, ArrowUpDown, Filter, X, Upload, Layers, Compass,
  ArrowRight, Download, Star, ExternalLink, Eye, FileText, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ResourceCard, ResourceCardSkeleton } from '../components/resources/ResourceCard';
import { ErrorState } from '../components/common/States';
import { getBooks } from '../api/books';
import {
  setBooks, setLoading, setError, setSearchQuery,
  selectFilteredBooks, selectBooksLoading, selectBooksError, selectSearchQuery,
} from '../features/books/booksSlice';
import { cn, fileTypeLabel, fileTypeColor, formatDate, getAuthorName } from '../lib/utils';

export default function LibraryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allFilteredBooks = useSelector(selectFilteredBooks);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);
  const searchQuery = useSelector(selectSearchQuery);
  const totalCount = useSelector((s) => s.books.items.length);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFileType, setSelectedFileType] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid | list | table

  // Quick Preview Modal state
  const [previewBook, setPreviewBook] = useState(null);

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

  const categories = [
    'ALL',
    'Computer Science',
    'Applied Mathematics',
    'Applied Physics',
    'Systems Engineering',
    'Research Papers'
  ];

  const fileTypeOptions = ['ALL', 'PDF', 'DOCX', 'PPTX', 'XLSX', 'TXT'];

  const displayedBooks = useMemo(() => {
    let result = (allFilteredBooks || []).filter((book) => {
      if (!book) return false;
      if (selectedFileType !== 'ALL' && book.fileType?.toUpperCase() !== selectedFileType) {
        return false;
      }
      if (selectedCategory !== 'ALL') {
        const cat = (book.category || '').toLowerCase();
        const searchCat = selectedCategory.toLowerCase();
        if (!cat.includes(searchCat)) return false;
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortBy === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sortBy === 'pages') return (b.pages || 0) - (a.pages || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
  }, [allFilteredBooks, selectedFileType, selectedCategory, sortBy]);

  // Export Catalog Data to CSV
  function handleExportCsv() {
    if (displayedBooks.length === 0) return;
    const headers = ['ID', 'Title', 'Author', 'Category', 'Format', 'Pages', 'Rating', 'Downloads'];
    const rows = displayedBooks.map((b) => [
      b.bookId,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author?.name || b.author || '').replace(/"/g, '""')}"`,
      `"${b.category || 'General'}"`,
      b.fileType || 'PDF',
      b.pages || 0,
      b.averageRating || 5.0,
      b.downloadCount || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `resource_library_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout breadcrumb="Resource Catalog">
      {/* Top Header & Search Toolbar */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6 sticky top-16 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Enterprise Resource Catalog
              </h1>
              <span className="badge-enterprise badge-indigo">
                {displayedBooks.length} of {totalCount} indexed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated collection of monographs, technical whitepapers, lecture decks, and peer-reviewed studies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="btn-ghost text-xs px-3.5 py-2.5"
              title="Export filtered records to CSV"
            >
              <Download size={14} /> Export CSV
            </button>
            <Link to="/upload" className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20">
              <Plus size={15} /> Upload Resource
            </Link>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
            <input
              type="search"
              id="library-search"
              className="input-base pr-9 py-2 text-xs rounded-xl"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by title, subject matter, or author..."
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

          {/* Filtering and Sort Options */}
          <div className="flex flex-wrap items-center gap-2.5 justify-between xl:justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap',
                    selectedCategory === cat
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {cat === 'ALL' ? 'All Subjects' : cat}
                </button>
              ))}
            </div>

            {/* File Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {fileTypeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFileType(type)}
                  className={cn(
                    'px-2 py-1 rounded-lg text-[10px] font-bold transition-all font-mono',
                    selectedFileType === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="pages">Page Count</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                )}
                title="Grid Card View"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                )}
                title="List View"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                )}
                title="Enterprise Data Table View"
              >
                <TableIcon size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
          <div className="enterprise-card p-12 text-center bg-white max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              No matching resources found
            </h3>
            <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              No materials match your current filter criteria. Try adjusting the query, clearing the subject filter, or upload a new resource.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedFileType('ALL');
                  dispatch(setSearchQuery(''));
                }}
                className="btn-ghost text-xs px-4 py-2"
              >
                Reset All Filters
              </button>
              <Link to="/upload" className="btn-accent text-xs px-4 py-2">
                Upload New Document
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayedBooks.map((book, i) => (
              <ResourceCard key={book.bookId} book={book} index={i} />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="enterprise-card bg-white divide-y divide-slate-100 overflow-hidden shadow-xs">
            {displayedBooks.map((book) => (
              <div
                key={book.bookId}
                className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={cn('px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase', fileTypeColor(book.fileType))}>
                    {fileTypeLabel(book.fileType)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/library/${book.bookId}`}
                      className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {getAuthorName(book.author)} · {book.category || 'General'} · {book.pages ? `${book.pages} pages` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden md:flex items-center gap-1 text-xs text-amber-500 font-semibold font-mono">
                    <Star size={13} className="fill-amber-400" />
                    <span>{book.averageRating || '4.9'}</span>
                  </div>
                  <button
                    onClick={() => setPreviewBook(book)}
                    className="btn-ghost text-xs px-3 py-1.5"
                    title="Quick Preview"
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <Link
                    to={`/library/${book.bookId}`}
                    className="btn-accent text-xs px-3.5 py-1.5"
                  >
                    Inspect <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Enterprise Data Table View */
          <div className="enterprise-card bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Document Title</th>
                    <th>Author / Faculty</th>
                    <th>Discipline</th>
                    <th>Format</th>
                    <th>Pages</th>
                    <th>Rating</th>
                    <th>Downloads</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBooks.map((book) => (
                    <tr key={book.bookId} className="hover:bg-slate-50 transition-colors">
                      <td className="max-w-xs font-semibold text-slate-900">
                        <Link
                          to={`/library/${book.bookId}`}
                          className="hover:text-indigo-600 transition-colors line-clamp-1 block"
                        >
                          {book.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono">ID: #{book.bookId}</span>
                      </td>
                      <td className="text-xs text-slate-600">
                        {getAuthorName(book.author)}
                      </td>
                      <td>
                        <span className="badge-enterprise badge-slate">
                          {book.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase', fileTypeColor(book.fileType))}>
                          {fileTypeLabel(book.fileType)}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-600">
                        {book.pages || '—'}
                      </td>
                      <td>
                        <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-600">
                          <Star size={12} className="fill-amber-400" />
                          {book.averageRating || '4.8'}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-500">
                        {book.downloadCount || 120}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setPreviewBook(book)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Quick preview"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            to={`/reader/${book.bookId}`}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Read in browser"
                          >
                            <BookOpen size={15} />
                          </Link>
                          <Link
                            to={`/library/${book.bookId}`}
                            className="btn-ghost text-xs px-2.5 py-1 bg-white"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick Document Preview Modal */}
      <AnimatePresence>
        {previewBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewBook(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-7 z-10 space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={cn('px-2.5 py-1 rounded text-xs font-mono font-bold uppercase', fileTypeColor(previewBook.fileType))}>
                    {fileTypeLabel(previewBook.fileType)}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    {previewBook.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    By {getAuthorName(previewBook.author)} · {previewBook.pages} pages
                  </p>
                </div>
                <button
                  onClick={() => setPreviewBook(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                <p className="font-bold text-slate-800 mb-1 font-mono uppercase text-[10px] tracking-wider">Document Synopsis</p>
                {previewBook.description || 'No detailed description provided for this academic resource.'}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <span className="text-[10px] text-indigo-500 font-bold uppercase">Format</span>
                  <p className="font-extrabold text-indigo-900 mt-0.5">{previewBook.fileType}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] text-amber-500 font-bold uppercase">Rating</span>
                  <p className="font-extrabold text-amber-900 mt-0.5">★ {previewBook.averageRating || '4.9'}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Downloads</span>
                  <p className="font-extrabold text-emerald-900 mt-0.5">{previewBook.downloadCount || 140}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setPreviewBook(null)}
                  className="btn-ghost text-xs px-4 py-2"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigate(`/reader/${previewBook.bookId}`);
                    setPreviewBook(null);
                  }}
                  className="btn-accent text-xs px-5 py-2"
                >
                  Read in Browser <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
