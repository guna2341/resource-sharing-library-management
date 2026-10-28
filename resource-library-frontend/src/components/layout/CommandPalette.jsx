import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Upload, Users, Trophy, GraduationCap, Heart,
  ShieldAlert, User, ArrowRight, X, Sparkles, FileText, Compass, Globe
} from 'lucide-react';
import { mockStore } from '../../api/mockStore';

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setBooks(mockStore.getBooks());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'Scholar Social Network & Posts', path: '/network', icon: Globe, category: 'Network' },
    { label: 'Browse Library Catalog', path: '/library', icon: BookOpen, category: 'Navigation' },
    { label: 'Study Circles & Communities', path: '/communities', icon: Users, category: 'Collaboration' },
    { label: 'Scholarly Leaderboard & Badges', path: '/leaderboard', icon: Trophy, category: 'Honors' },
    { label: 'Authors & Faculty Directory', path: '/authors', icon: GraduationCap, category: 'Directory' },
    { label: 'Saved Reading Wishlist', path: '/wishlist', icon: Heart, category: 'Personal' },
    { label: 'Upload New Resource', path: '/upload', icon: Upload, category: 'Actions' },
    { label: 'Enterprise Admin Portal', path: '/admin', icon: ShieldAlert, category: 'Management' },
    { label: 'My Profile & Credentials', path: '/profile', icon: User, category: 'Account' },
  ];

  const qLower = (query || '').toLowerCase().trim();

  const filteredNav = quickNav.filter(
    (item) =>
      !qLower ||
      (item.label || '').toLowerCase().includes(qLower) ||
      (item.category || '').toLowerCase().includes(qLower)
  );

  const filteredBooks = books
    .filter((b) => {
      if (!b) return false;
      if (!qLower) return true;
      const title = (b.title || '').toLowerCase();
      const author = (typeof b.author === 'object' ? (b.author?.name || '') : String(b.author || '')).toLowerCase();
      const cat = (b.category || '').toLowerCase();
      const tags = Array.isArray(b.tags) ? b.tags.map((t) => String(t).toLowerCase()) : [];

      return (
        title.includes(qLower) ||
        author.includes(qLower) ||
        cat.includes(qLower) ||
        tags.some((t) => t.includes(qLower))
      );
    })
    .slice(0, 4);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
            <Search size={18} className="text-slate-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, navigate hubs, or run actions... (ESC to close)"
              className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={15} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-500 border border-slate-200">
              ESC
            </kbd>
          </div>

          {/* Results Container */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {/* Matching Documents */}
            {query && filteredBooks.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Documents & Resources ({filteredBooks.length})
                </p>
                <div className="space-y-1 mt-1">
                  {filteredBooks.map((book) => (
                    <button
                      key={book.bookId}
                      onClick={() => handleSelect(`/library/${book.bookId}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={16} className="m-auto text-slate-400 mt-2" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                            {book.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {typeof book.author === 'object' ? (book.author?.name || 'Academic Scholar') : (book.author || 'Academic Scholar')} · {book.fileType} · {book.pages} pages
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Navigation Items */}
            <div>
              <p className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Platform Workspaces & Tools
              </p>
              <div className="space-y-1 mt-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.category}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600">
                        {item.path}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {query && filteredBooks.length === 0 && filteredNav.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching results found for "{query}".
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-500" /> Enterprise Academic Command Palette
            </span>
            <div className="flex items-center gap-2">
              <span>Navigate: ↵</span>
              <span>Dismiss: ESC</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
