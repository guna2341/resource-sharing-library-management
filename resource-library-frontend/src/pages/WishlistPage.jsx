import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Trash2, BookOpen, ExternalLink, ArrowRight, Bookmark,
  Download, Sparkles, Filter, CheckCircle2, Clock, FileText, ArrowUpDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getWishlist, removeFromWishlist } from '../api/wishlist';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { CoverImage } from '../components/resources/ResourceCard';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, fileTypeLabel, fileTypeColor } from '../lib/utils';

export default function WishlistPage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [wishlist, setWishlist] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadWishlist() {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getWishlist(user.userId)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setWishlist(res.data);
        } else {
          setWishlist([]);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load wishlist.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadWishlist();
  }, [user?.userId]);

  async function handleRemove(wishlistId) {
    try {
      setWishlist((prev) => prev.filter((item) => item.wishlistId !== wishlistId));
      await removeFromWishlist(wishlistId);
    } catch {
      loadWishlist();
    }
  }

  const displayedList = useMemo(() => {
    let list = (wishlist || []).filter((item) => {
      if (!item || !item.book) return false;
      if (selectedFormat === 'ALL') return true;
      return (item.book?.fileType || '').toUpperCase() === selectedFormat;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'title') return (a.book?.title || '').localeCompare(b.book?.title || '');
      if (sortBy === 'pages') return (b.book?.pages || 0) - (a.book?.pages || 0);
      return (b.wishlistId || 0) - (a.wishlistId || 0);
    });
  }, [wishlist, selectedFormat, sortBy]);

  const totalPages = wishlist.reduce((acc, item) => acc + (item.book?.pages || 0), 0);
  const estimatedHours = Math.round(totalPages / 30); // ~30 pages per hour

  // Export Reading List to Markdown
  function handleExportMarkdown() {
    if (wishlist.length === 0) return;
    const lines = [
      `# Scholar Reading Queue — ${user?.username || 'Personal Research'}`,
      `Exported on: ${new Date().toLocaleDateString()}`,
      `Total Documents: ${wishlist.length} | Total Pages: ${totalPages}`,
      '',
      '## Reading List',
      ...wishlist.map((item, idx) => {
        const b = item.book;
        return `${idx + 1}. **${b?.title || 'Untitled'}** — ${b?.author?.name || 'Faculty Author'} (${b?.fileType}, ${b?.pages || 0} pages)`;
      })
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_reading_queue_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <AppLayout breadcrumb="Reading Wishlist">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-rose">
                <Heart size={11} className="fill-rose-500 text-rose-500" />
                Personal Research Archive
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Reading Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Personal Reading Wishlist
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Curate textbook editions, study guides, and research papers earmarked for upcoming study sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {wishlist.length > 0 && (
              <button
                onClick={handleExportMarkdown}
                className="btn-ghost text-xs px-3.5 py-2.5"
                title="Export Reading Queue to Markdown"
              >
                <Download size={14} /> Export Queue (.md)
              </button>
            )}
            <Link to="/library" className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20">
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* Quick Queue Metrics & Filter Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <span className="font-bold text-slate-900">{wishlist.length} documents saved</span>
            <span>·</span>
            <span>~{estimatedHours} estimated study hours</span>
            <span>·</span>
            <span>{totalPages} total pages</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Format Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-mono font-bold">
              {['ALL', 'PDF', 'DOCX', 'PPTX'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg transition-all',
                    selectedFormat === fmt ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="newest">Recently Saved</option>
                <option value="pages">Most Pages</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="enterprise-card p-5 bg-white animate-pulse space-y-4">
                <div className="aspect-4/3 rounded-2xl bg-slate-200" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadWishlist} />
        ) : displayedList.length === 0 ? (
          <div className="enterprise-card p-16 text-center max-w-md mx-auto my-12 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Heart size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Your reading queue is empty</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Bookmark course syllabus materials, research papers, and monographs for quick future access.
            </p>
            <Link to="/library" className="btn-accent text-xs px-5 py-2.5">
              Explore Library Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {displayedList.map((item) => {
                const book = item.book;
                if (!book) return null;
                return (
                  <motion.div
                    key={item.wishlistId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="enterprise-card p-4 bg-white flex flex-col justify-between group space-y-4"
                  >
                    <div>
                      {/* Cover Image */}
                      <div className="aspect-4/3 rounded-2xl overflow-hidden mb-3.5 relative bg-slate-100 border border-slate-100">
                        <CoverImage
                          coverUrl={book.coverUrl}
                          title={book.title}
                          fileType={book.fileType}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span
                          className={cn(
                            'absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider',
                            fileTypeColor(book.fileType)
                          )}
                        >
                          {fileTypeLabel(book.fileType)}
                        </span>

                        <button
                          onClick={() => handleRemove(item.wishlistId)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/40 hover:bg-rose-600 text-white transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {book.author?.name || book.author || 'Faculty Scholar'} · {book.pages || 0} pages
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/reader/${book.bookId}`}
                        className="btn-accent text-xs px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <BookOpen size={13} /> Read Now
                      </Link>

                      <Link
                        to={`/library/${book.bookId}`}
                        className="btn-ghost text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-white"
                      >
                        Details
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
