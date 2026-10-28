import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, GraduationCap, Building, Star, Share2, Check,
  ArrowLeft, ExternalLink, Download, FileText, Sparkles, Filter,
  MessageSquare, Heart, Bookmark, Search, Clock, Award, ShieldCheck,
  UserPlus, UserCheck, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getAuthorById } from '../api/authors';
import { getBooks } from '../api/books';
import { networkApi } from '../api/network';
import { AppLayout } from '../components/layout/AppLayout';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, formatDate, formatRelativeDate, fileTypeColor, fileTypeLabel, getInitials, DEFAULT_AUTHOR_AVATAR } from '../lib/utils';

export default function AuthorDetailPage() {
  const { authorId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'works' | 'updates'
  const [activeTab, setActiveTab] = useState('works');
  const [worksSearchQuery, setWorksSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Follow & Social State
  const [followedAuthorIds, setFollowedAuthorIds] = useState(networkApi.getFollowedAuthorIds());
  const [copied, setCopied] = useState(false);
  const [likedBookIds, setLikedBookIds] = useState(networkApi.getLikedBookIds());

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getAuthorById(authorId).catch(() => ({ success: false, data: null })),
      getBooks().catch(() => ({ success: false, data: [] }))
    ])
      .then(([authorRes, booksRes]) => {
        if (authorRes.success && authorRes.data) {
          setAuthor(authorRes.data);
        } else {
          setError('Author profile not found or could not be loaded.');
        }

        if (booksRes.success && Array.isArray(booksRes.data)) {
          setBooks(booksRes.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Error loading author details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authorId]);

  // Books authored by this specific author
  const authorBooks = useMemo(() => {
    if (!author) return [];
    const targetIdStr = String(author.authorId);
    const targetName = (author.name || '').toLowerCase().trim();

    return books.filter((b) => {
      if (typeof b.author === 'object' && b.author !== null) {
        return (
          String(b.author.authorId) === targetIdStr ||
          (b.author.name && b.author.name.toLowerCase().trim() === targetName)
        );
      }
      if (typeof b.author === 'string') {
        return b.author.toLowerCase().trim() === targetName || b.author === targetIdStr;
      }
      return false;
    });
  }, [books, author]);

  // Categories in author's works
  const categories = useMemo(() => {
    const set = new Set();
    authorBooks.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [authorBooks]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return authorBooks.filter((b) => {
      if (selectedCategory !== 'ALL' && b.category !== selectedCategory) {
        return false;
      }
      if (worksSearchQuery.trim()) {
        const q = worksSearchQuery.toLowerCase().trim();
        const titleMatch = (b.title || '').toLowerCase().includes(q);
        const descMatch = (b.description || '').toLowerCase().includes(q);
        const catMatch = (b.category || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }
      return true;
    });
  }, [authorBooks, selectedCategory, worksSearchQuery]);

  // Posts published by this author in Scholar Network
  const authorPosts = useMemo(() => {
    if (!author) return [];
    const allPosts = networkApi.getPosts();
    const targetIdStr = String(author.authorId);
    const targetName = (author.name || '').toLowerCase().trim();

    return allPosts.filter((p) => {
      if (!p.author) return false;
      return (
        String(p.author.authorId) === targetIdStr ||
        (p.author.name && p.author.name.toLowerCase().trim() === targetName)
      );
    });
  }, [author]);

  // Metrics
  const totalPagesCount = useMemo(() => {
    return authorBooks.reduce((sum, b) => sum + (Number(b.pages) || 48), 0);
  }, [authorBooks]);

  const isFollowed = author ? followedAuthorIds.some((id) => String(id) === String(author.authorId)) : false;

  function handleToggleFollow() {
    if (!author) return;
    networkApi.toggleFollow(author.authorId, author.name);
    setFollowedAuthorIds(networkApi.getFollowedAuthorIds());
  }

  function handleShareProfile() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleToggleLikeBook(bId) {
    networkApi.toggleLikeBook(bId);
    setLikedBookIds(networkApi.getLikedBookIds());
  }

  if (loading) {
    return (
      <AppLayout breadcrumb="Author Dossier">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-sm font-mono text-slate-500">Retrieving faculty dossier & bibliography...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !author) {
    return (
      <AppLayout breadcrumb="Author Not Found">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Author Profile Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {error || 'The requested faculty profile could not be located in the institutional catalog.'}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button onClick={() => navigate('/authors')} className="btn-accent text-xs px-5 py-2.5">
              <ArrowLeft size={14} /> Back to Authors Directory
            </button>
            <button onClick={() => navigate('/network')} className="btn-ghost text-xs px-5 py-2.5">
              Go to Scholar Network
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumb={`Authors / ${author.name}`}>
      {/* Top Breadcrumb & Quick Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500">
            <Link to="/authors" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-bold">
              <ArrowLeft size={13} /> Authors Directory
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-xs">{author.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 rounded-lg border border-slate-200"
              title="Copy author profile link"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
              <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* AUTHOR HERO CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl p-6 sm:p-10 border border-slate-800">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-800 border-2 border-indigo-400/40 shadow-2xl flex-shrink-0">
                  <img
                    src={author.profileUrl || DEFAULT_AUTHOR_AVATAR}
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-900">
                  <ShieldCheck size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-enterprise bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                    Verified Academic Author
                  </span>
                  <span className="badge-enterprise bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono">
                    ID #{author.authorId}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {author.name}
                </h1>

                <p className="text-sm text-indigo-200 font-medium flex items-center gap-2">
                  <Building size={14} className="text-indigo-400" />
                  <span>{author.department || 'Faculty Department of Computing & Engineering'}</span>
                </p>

                <p className="text-xs text-slate-300/90 max-w-xl leading-relaxed pt-1">
                  {author.bio ||
                    'Esteemed faculty author and research director. Specializes in advanced systems architecture, formal verification, algorithm design, and peer-reviewed educational literature.'}
                </p>
              </div>
            </div>

            {/* Right: Follow CTA & Meta Badges */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={handleToggleFollow}
                className={cn(
                  'px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer',
                  isFollowed
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-white hover:bg-indigo-50 text-indigo-950 shadow-white/10'
                )}
              >
                {isFollowed ? (
                  <>
                    <UserCheck size={15} /> Following Faculty
                  </>
                ) : (
                  <>
                    <UserPlus size={15} /> Follow Author
                  </>
                )}
              </button>

              <Link
                to={`/network?author=${author.authorId}`}
                className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={13} /> View Scholar Feed
              </Link>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-center font-mono">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Published Works</span>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{authorBooks.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Pages</span>
              <p className="text-xl sm:text-2xl font-extrabold text-indigo-300 mt-1">{totalPagesCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Research Updates</span>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{authorPosts.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Faculty Status</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1">
                <Check size={12} /> Active Contributor
              </p>
            </div>
          </div>
        </div>

        {/* TAB CONTROLS: Works vs Updates */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('works')}
              className={cn(
                'px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2',
                activeTab === 'works'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              )}
            >
              <BookOpen size={14} />
              <span>Published Manuscripts & Books ({authorBooks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={cn(
                'px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2',
                activeTab === 'updates'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              )}
            >
              <Sparkles size={14} />
              <span>Research Updates ({authorPosts.length})</span>
            </button>
          </div>

          {activeTab === 'works' && (
            <div className="flex items-center gap-3">
              {/* Category Filter Pills */}
              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter published works..."
                  value={worksSearchQuery}
                  onChange={(e) => setWorksSearchQuery(e.target.value)}
                  className="input-base pl-8 py-1.5 text-xs rounded-xl w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* CONTENT VIEW: PUBLISHED WORKS */}
        {activeTab === 'works' && (
          <div className="space-y-6">
            {/* Category Filter Chips */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-slate-400 font-mono text-[11px] mr-1">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all',
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {filteredBooks.length === 0 ? (
              <div className="enterprise-card p-16 text-center bg-white space-y-4">
                <BookOpen size={36} className="mx-auto text-slate-300" />
                <h3 className="text-base font-extrabold text-slate-800">
                  {authorBooks.length === 0
                    ? `No catalog manuscripts uploaded yet for ${author.name}`
                    : 'No published works match your search filter'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {authorBooks.length === 0
                    ? 'This author is verified in the faculty roster, but published volumes have not been indexed yet. Check back soon!'
                    : 'Try clearing your category or text search above to reveal all publications.'}
                </p>
                {authorBooks.length > 0 && (
                  <button
                    onClick={() => {
                      setWorksSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBooks.map((book) => {
                  const isLiked = likedBookIds.some((id) => String(id) === String(book.bookId));

                  return (
                    <motion.div
                      key={book.bookId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="enterprise-card p-6 bg-white flex flex-col justify-between space-y-5 hover:shadow-lg transition-all group border border-slate-200/80"
                    >
                      <div className="flex gap-4 items-start">
                        {/* Cover Image */}
                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-white">
                              <BookOpen size={20} className="mb-1 text-indigo-400" />
                              <span className="text-[10px] font-mono font-bold uppercase">{book.fileType || 'PDF'}</span>
                            </div>
                          )}
                        </div>

                        {/* Title, Category & Details */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase', fileTypeColor(book.fileType))}>
                              {fileTypeLabel(book.fileType)}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {book.pages || 48} pages
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                            {book.title}
                          </h3>

                          <p className="text-xs text-slate-500 font-mono">
                            Category: <span className="font-bold text-slate-700">{book.category || 'Academic Literature'}</span>
                          </p>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                            {book.description ||
                              'Comprehensive research monograph covering theoretical paradigms, empirical benchmarks, and practical applications.'}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleLikeBook(book.bookId)}
                            className={cn(
                              'p-2 rounded-xl border text-xs transition-colors flex items-center gap-1.5 font-bold',
                              isLiked
                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-600'
                            )}
                            title={isLiked ? 'Liked manuscript' : 'Like manuscript'}
                          >
                            <Heart size={13} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                          </button>

                          {book.fileUrl && (
                            <a
                              href={book.fileUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
                              title="Download document"
                            >
                              <Download size={13} />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/reader/${book.bookId}`}
                            className="btn-accent text-xs px-4 py-2 shadow-xs flex items-center gap-1.5"
                          >
                            <BookOpen size={13} /> Read Book
                          </Link>
                          <Link
                            to={`/library/${book.bookId}`}
                            className="btn-ghost text-xs px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTENT VIEW: RESEARCH DISPATCHES & UPDATES */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {authorPosts.length === 0 ? (
              <div className="enterprise-card p-16 text-center bg-white space-y-4">
                <Sparkles size={36} className="mx-auto text-slate-300" />
                <h3 className="text-base font-extrabold text-slate-800">
                  No scholarly dispatches posted yet
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {author.name} has not broadcast any research updates or theorem discussions to the Scholar Network yet.
                </p>
                <Link to="/network" className="btn-accent text-xs px-5 py-2 inline-flex items-center gap-1.5">
                  Browse Global Scholar Network <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {authorPosts.map((post) => (
                  <div
                    key={post.postId}
                    className="enterprise-card p-6 bg-white space-y-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img
                            src={author.profileUrl || DEFAULT_AUTHOR_AVATAR}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">{author.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatRelativeDate(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      <span className="badge-enterprise badge-indigo text-[10px] font-mono">
                        Network Post
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Attached Book if present */}
                    {post.attachedBook && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <BookOpen size={16} className="text-indigo-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-indigo-950 truncate">
                              {post.attachedBook.title}
                            </p>
                            <span className="text-[10px] font-mono text-indigo-600">
                              Referenced Catalog Publication
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/reader/${post.attachedBook.bookId}`}
                          className="btn-accent text-xs px-3 py-1 flex-shrink-0"
                        >
                          Read
                        </Link>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{post.likesCount || 0} academic endorsements</span>
                      <Link
                        to={`/network?author=${author.authorId}`}
                        className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                      >
                        Engage on Network <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
