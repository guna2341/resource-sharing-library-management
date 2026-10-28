import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Maximize2, X, Download, Bookmark,
  Trash2, Plus, CheckCircle2, Flame, ZoomIn, ZoomOut, RotateCcw,
  Sun, Moon, Coffee, Share2, Quote, BookOpen, FileText, ChevronLeft,
  ChevronRight, Check, Copy, Sparkles, Shield
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getBookById, recordBookDownload } from '../api/books';
import { recordReadingActivity } from '../api/reading';
import { getBookmarksByBookId, addBookmark, removeBookmark } from '../api/bookmarks';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn } from '../lib/utils';

export default function ReaderPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reader Settings: Theme & Zoom
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'sepia' | 'light'
  const [zoomLevel, setZoomLevel] = useState(100); // 75, 100, 125, 150
  const [currentPage, setCurrentPage] = useState(1);

  // Bookmarks & Notes State
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [activityRecorded, setActivityRecorded] = useState(false);

  // Citation Modal
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState('');

  function loadBookmarks() {
    if (!user?.userId || !bookId) return;
    getBookmarksByBookId(user.userId, bookId)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setBookmarks(res.data);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    getBookById(bookId)
      .then((res) => {
        if (res.success) {
          setBook(res.data);
        } else {
          setError(res.message || 'Resource not found.');
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load resource.'))
      .finally(() => setLoading(false));

    if (user?.userId) {
      recordReadingActivity(user.userId)
        .then(() => setActivityRecorded(true))
        .catch(() => {});
      loadBookmarks();
    }
  }, [bookId, user?.userId]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  async function handleAddBookmark(e) {
    e.preventDefault();
    if (!user?.userId || !bookId) return;
    setAddingBookmark(true);
    try {
      const res = await addBookmark(user.userId, bookId, {
        page: Number(bookmarkPage),
        note: bookmarkNote.trim()
      });
      if (res.success) {
        setBookmarkNote('');
        loadBookmarks();
      }
    } catch {}
    finally {
      setAddingBookmark(false);
    }
  }

  async function handleDeleteBookmark(bookmarkId) {
    try {
      await removeBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => (b.bookMarkId || b.bookmarkId) !== bookmarkId));
    } catch {}
  }

  const citations = {
    APA: `${book?.author?.name || 'Author, A.'} (${new Date(book?.createdAt || Date.now()).getFullYear()}). ${book?.title}. Academic Resource Library.`,
    MLA: `${book?.author?.name || 'Author, A.'} "${book?.title}." Academic Resource Library, ${new Date(book?.createdAt || Date.now()).getFullYear()}.`,
    BibTeX: `@misc{resourcelib_${book?.bookId},\n  title={${book?.title}},\n  author={${book?.author?.name || 'Author'}},\n  year={${new Date(book?.createdAt || Date.now()).getFullYear()}}\n}`,
  };

  function copyCitationText(format) {
    navigator.clipboard.writeText(citations[format]);
    setCopiedCitation(format);
    setTimeout(() => setCopiedCitation(''), 2000);
  }

  const themeStyles = {
    dark: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#FBF0D9] text-[#433422]',
    light: 'bg-white text-slate-900',
  };

  const toolbarStyles = {
    dark: 'bg-slate-900 border-slate-800 text-slate-300',
    sepia: 'bg-[#F4E6C3] border-[#E8D4A2] text-[#433422]',
    light: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading document reader…</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <ErrorState message={error || 'Document not found.'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const totalPages = book.pages || 100;

  return (
    <div className={cn('min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300', themeStyles[themeMode])}>
      {/* Top Reading Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('h-14 px-4 sm:px-6 border-b flex items-center justify-between gap-3 flex-shrink-0 z-30 transition-colors', toolbarStyles[themeMode])}
      >
        {/* Left: Back & Title info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            aria-label="Back"
            title="Return to previous page"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="w-px h-4 bg-current opacity-20 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-xs md:max-w-md">
              {book.title}
            </h1>
            <p className="text-[11px] opacity-70 truncate hidden sm:block">
              {book.author?.name || 'Faculty Author'} · {book.fileType || 'PDF'}
            </p>
          </div>

          {activityRecorded && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-amber-500 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex-shrink-0">
              <Flame size={11} /> Reading Streak Active
            </span>
          )}
        </div>

        {/* Center: Page Jump Navigation */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value) || 1)))}
            className="w-12 text-center py-0.5 px-1 rounded bg-black/10 font-bold border border-current border-opacity-20 outline-none"
          />
          <span>of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 px-1 py-0.5 rounded bg-black/10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
              className="p-1 hover:opacity-100 opacity-70"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[11px] font-mono px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
              className="p-1 hover:opacity-100 opacity-70"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-black/10">
            <button
              onClick={() => setThemeMode('dark')}
              className={cn('p-1 rounded', themeMode === 'dark' && 'bg-black/20 text-indigo-400')}
              title="Obsidian Dark"
            >
              <Moon size={13} />
            </button>
            <button
              onClick={() => setThemeMode('sepia')}
              className={cn('p-1 rounded', themeMode === 'sepia' && 'bg-black/20 text-amber-700')}
              title="Warm Sepia"
            >
              <Coffee size={13} />
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={cn('p-1 rounded', themeMode === 'light' && 'bg-black/20 text-slate-900')}
              title="Paper White"
            >
              <Sun size={13} />
            </button>
          </div>

          {/* Citation Button */}
          <button
            onClick={() => setShowCitationModal(true)}
            className="p-1.5 rounded hover:bg-black/10 transition-colors"
            title="Generate Citation"
          >
            <Quote size={15} />
          </button>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => setShowBookmarksDrawer((v) => !v)}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors',
              showBookmarksDrawer ? 'bg-indigo-600 text-white' : 'hover:bg-black/10'
            )}
            title="Bookmarks"
          >
            <Bookmark size={13} />
            <span className="hidden sm:inline">Bookmarks ({bookmarks.length})</span>
          </button>

          {/* Download */}
          <a
            href={book.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={() => {
              if (user?.userId && book?.bookId) {
                recordBookDownload(book.bookId, user.userId).catch(() => {});
              }
            }}
            className="p-1.5 rounded hover:bg-black/10 transition-colors"
            title="Download Document"
          >
            <Download size={15} />
          </a>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-black/10 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </motion.div>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Document Rendering Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-5xl h-full shadow-2xl rounded-xl overflow-hidden border border-current border-opacity-10 bg-white"
          >
            {book.fileUrl?.endsWith('.pdf') || book.fileType === 'PDF' ? (
              <iframe
                src={`${book.fileUrl}#page=${currentPage}`}
                title={book.title}
                className="w-full h-full min-h-[calc(100vh-120px)] border-none"
                allow="fullscreen"
              />
            ) : (
              /* Fallback Viewer Canvas for Non-PDFs or Local Documents */
              <div className="p-12 text-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                  {book.description || 'This document is available for direct download and reading in your preferred external suite.'}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent text-xs px-5 py-2.5"
                  >
                    <Download size={14} /> Download Document
                  </a>
                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs px-5 py-2.5"
                  >
                    <ExternalLink size={14} /> Open in New Tab
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookmarks & Notes Slide-Over Drawer */}
        <AnimatePresence>
          {showBookmarksDrawer && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-80 border-l border-current border-opacity-20 p-5 flex flex-col justify-between z-20 overflow-y-auto bg-black/20 backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-current border-opacity-10 mb-4">
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Bookmark size={14} className="text-indigo-400" />
                    Academic Bookmarks
                  </h3>
                  <button
                    onClick={() => setShowBookmarksDrawer(false)}
                    className="p-1 hover:opacity-70 text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Add Bookmark Form */}
                <form onSubmit={handleAddBookmark} className="space-y-3 mb-6 p-3 rounded-xl bg-black/20 border border-current border-opacity-10">
                  <label className="block text-[11px] font-mono opacity-70">
                    Bookmark Page
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={bookmarkPage}
                      onChange={(e) => setBookmarkPage(e.target.value)}
                      className="bg-black/20 border border-current border-opacity-20 rounded-lg px-2.5 py-1.5 text-xs w-full font-mono outline-none"
                    />
                    <button
                      type="submit"
                      disabled={addingBookmark}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex-shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Optional note / topic..."
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    className="bg-black/20 border border-current border-opacity-20 rounded-lg px-2.5 py-1 text-[11px] w-full outline-none"
                  />
                </form>

                {/* Bookmarks List */}
                <div className="space-y-2">
                  {bookmarks.length === 0 ? (
                    <p className="text-xs opacity-50 text-center py-6">
                      No bookmarks saved yet. Add a page to save your place!
                    </p>
                  ) : (
                    bookmarks.map((bm) => {
                      const bmId = bm.bookMarkId || bm.bookmarkId;
                      return (
                        <div
                          key={bmId || Math.random()}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-current border-opacity-10 hover:border-indigo-400 transition-colors"
                        >
                          <button
                            onClick={() => setCurrentPage(bm.page || 1)}
                            className="flex items-center gap-2 text-left min-w-0"
                          >
                            <Bookmark size={13} className="text-indigo-400 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-bold font-mono block">
                                Page {bm.page || 1}
                              </span>
                              {bm.note && (
                                <span className="text-[10px] opacity-70 truncate block">{bm.note}</span>
                              )}
                            </div>
                          </button>

                          <button
                            onClick={() => handleDeleteBookmark(bmId)}
                            className="p-1 hover:text-rose-400 opacity-60 hover:opacity-100 transition-colors"
                            title="Delete bookmark"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-current border-opacity-10 text-center">
                <p className="text-[10px] font-mono opacity-50">
                  Reading streak recorded for today 🔥
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Citation Generator Modal */}
      <AnimatePresence>
        {showCitationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCitationModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Quote size={18} className="text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Academic Citation Generator</h3>
                </div>
                <button
                  onClick={() => setShowCitationModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(citations).map(([format, text]) => (
                  <div key={format} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-indigo-700">{format}</span>
                      <button
                        onClick={() => copyCitationText(format)}
                        className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                      >
                        {copiedCitation === format ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check size={12} /> Copied!
                          </span>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-slate-700 break-all leading-relaxed whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
