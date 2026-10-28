import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Users, UserPlus, UserCheck, Heart, ThumbsUp, MessageSquare,
  Share2, Send, BookOpen, Sparkles, Filter, Plus, X, Search,
  CheckCircle2, Clock, Award, Bookmark, ExternalLink, Hash,
  GraduationCap, FileText, ArrowRight, ShieldCheck, MoreHorizontal,
  Trash2, CornerDownRight, Check
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { networkApi } from '../api/network';
import { getAuthors } from '../api/authors';
import { getBooks } from '../api/books';
import { AppLayout } from '../components/layout/AppLayout';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, getInitials, formatDate, formatRelativeDate, fileTypeColor, fileTypeLabel } from '../lib/utils';

export default function NetworkPage() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [followedAuthorIds, setFollowedAuthorIds] = useState([]);
  const [likedBookIds, setLikedBookIds] = useState([]);
  const [bookCommentsMap, setBookCommentsMap] = useState({});

  // Active View Tabs & Filters
  const [activeTab, setActiveTab] = useState('all'); // all | following | books
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Author Spotlight / Filter
  const authorParam = searchParams.get('author');
  const [selectedAuthorId, setSelectedAuthorId] = useState(authorParam || null);
  const [authorSubTab, setAuthorSubTab] = useState('posts'); // posts | books

  // Expandable Post Comments
  const [expandedComments, setExpandedComments] = useState({});
  const [newCommentText, setNewCommentText] = useState({});

  // Expandable Book Comments
  const [expandedBookComments, setExpandedBookComments] = useState({});
  const [newBookCommentText, setNewBookCommentText] = useState({});

  const [copiedPostId, setCopiedPostId] = useState(null);

  // New Post Compose Modal
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [composeTags, setComposeTags] = useState('DistributedSystems, CloudArchitecture');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [postingAuthorId, setPostingAuthorId] = useState('1');
  const [publishing, setPublishing] = useState(false);

  function loadData() {
    setPosts(networkApi.getPosts());
    setFollowedAuthorIds(networkApi.getFollowedAuthorIds());
    setLikedBookIds(networkApi.getLikedBookIds());
    setBookCommentsMap(networkApi.getAllBookComments());
    getAuthors().then((res) => { if (res.success) setAuthors(res.data || []); });
    getBooks().then((res) => { if (res.success) setBooks(res.data || []); });
  }

  useEffect(() => {
    loadData();
  }, []);

  // Sync author filter with URL query param
  useEffect(() => {
    const param = searchParams.get('author');
    if (param) {
      setSelectedAuthorId(param);
    }
  }, [searchParams]);

  function handleSelectAuthor(authorId) {
    if (!authorId) {
      setSelectedAuthorId(null);
      setSearchParams({});
    } else {
      const idStr = String(authorId);
      setSelectedAuthorId(idStr);
      setSearchParams({ author: idStr });
    }
  }

  // Follow / Unfollow
  function handleToggleFollow(authorId, authorName) {
    networkApi.toggleFollow(authorId, authorName);
    setFollowedAuthorIds(networkApi.getFollowedAuthorIds());
  }

  // Like Post
  function handleLikePost(postId) {
    const updated = networkApi.toggleLikePost(postId);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.postId === postId ? { ...p, likes: updated.likes, likedByMe: updated.likedByMe } : p)));
    }
  }

  // Post Comments
  function togglePostComments(postId) {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function handleAddPostComment(postId, e) {
    e.preventDefault();
    const text = (newCommentText[postId] || '').trim();
    if (!text) return;
    const added = networkApi.addComment(postId, text, user);
    if (added) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.postId === postId) {
            return { ...p, comments: [...(p.comments || []), added] };
          }
          return p;
        })
      );
      setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
    }
  }

  function handleDeletePostComment(postId, commentId) {
    networkApi.deleteComment(postId, commentId);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.postId === postId) {
          return { ...p, comments: (p.comments || []).filter((c) => c.commentId !== commentId) };
        }
        return p;
      })
    );
  }

  // Book Likes
  function handleToggleLikeBook(bookId) {
    networkApi.toggleLikeBook(bookId);
    setLikedBookIds(networkApi.getLikedBookIds());
  }

  // Book Comments
  function toggleBookComments(bookId) {
    setExpandedBookComments((prev) => ({ ...prev, [bookId]: !prev[bookId] }));
  }

  function handleAddBookComment(bookId, e) {
    e.preventDefault();
    const text = (newBookCommentText[bookId] || '').trim();
    if (!text) return;
    networkApi.addBookComment(bookId, text, user);
    setBookCommentsMap(networkApi.getAllBookComments());
    setNewBookCommentText((prev) => ({ ...prev, [bookId]: '' }));
  }

  function handleDeleteBookComment(bookId, commentId) {
    networkApi.deleteBookComment(bookId, commentId);
    setBookCommentsMap(networkApi.getAllBookComments());
  }

  // Share link
  function handleShare(postId) {
    setCopiedPostId(postId);
    navigator.clipboard?.writeText(window.location.origin + `/network#post-${postId}`);
    setTimeout(() => setCopiedPostId(null), 2000);
  }

  // Publish Post Modal Submit
  function handlePublishPost(e) {
    e.preventDefault();
    if (!composeText.trim()) return;
    setPublishing(true);

    const postAuthor = authors.find((a) => String(a.authorId) === String(postingAuthorId)) || {
      authorId: 1,
      name: user?.username || 'Faculty Scholar',
      department: 'Academic Faculty',
      profileUrl: user?.profileUrl,
    };

    const attachedBookObj = books.find((b) => String(b.bookId) === String(selectedBookId)) || null;
    const tagList = composeTags.split(',').map((t) => t.trim()).filter(Boolean);

    const newPost = networkApi.createPost({
      author: postAuthor,
      content: composeText.trim(),
      attachedBook: attachedBookObj,
      tags: tagList,
    });

    setPosts((prev) => [newPost, ...prev]);
    setComposeText('');
    setSelectedBookId('');
    setShowComposeModal(false);
    setPublishing(false);
  }

  // Focused author object
  const currentSpotlightAuthor = useMemo(() => {
    if (!selectedAuthorId) return null;
    return authors.find((a) => String(a.authorId) === String(selectedAuthorId)) || null;
  }, [authors, selectedAuthorId]);

  // Books published by spotlight author
  const authorSpotlightBooks = useMemo(() => {
    if (!currentSpotlightAuthor) return [];
    let list = books.filter((b) => {
      if (typeof b.author === 'object') {
        return String(b.author?.authorId) === String(currentSpotlightAuthor.authorId) ||
          b.author?.name?.toLowerCase() === currentSpotlightAuthor.name?.toLowerCase();
      }
      return String(b.author).toLowerCase() === currentSpotlightAuthor.name?.toLowerCase();
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [books, currentSpotlightAuthor, searchQuery]);

  // Posts by spotlight author
  const authorSpotlightPosts = useMemo(() => {
    if (!currentSpotlightAuthor) return [];
    return posts.filter((p) => {
      return String(p.author?.authorId) === String(currentSpotlightAuthor.authorId) ||
        p.author?.name?.toLowerCase() === currentSpotlightAuthor.name?.toLowerCase();
    });
  }, [posts, currentSpotlightAuthor]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // If author spotlight is active, only show posts by this author
      if (selectedAuthorId) {
        const matchesAuthor = String(p.author?.authorId) === String(selectedAuthorId) ||
          p.author?.name?.toLowerCase() === currentSpotlightAuthor?.name?.toLowerCase();
        if (!matchesAuthor) return false;
      }

      // Tab filter
      if (activeTab === 'following') {
        const isAuthorFollowed = followedAuthorIds.some((id) => String(id) === String(p.author?.authorId));
        if (!isAuthorFollowed) return false;
      } else if (activeTab === 'books') {
        if (!p.attachedBook) return false;
      }

      // Tag filter
      if (selectedTag !== 'ALL') {
        const hasTag = (p.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }

      // Search query across content, author, department, book title/desc/category, and tags
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const contentMatch = (p.content || '').toLowerCase().includes(q);
        const authorMatch = (p.author?.name || '').toLowerCase().includes(q) ||
          (p.author?.department || '').toLowerCase().includes(q);
        const bookMatch = (p.attachedBook?.title || '').toLowerCase().includes(q) ||
          (p.attachedBook?.category || '').toLowerCase().includes(q) ||
          (p.attachedBook?.description || '').toLowerCase().includes(q);
        const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!contentMatch && !authorMatch && !bookMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [posts, selectedAuthorId, currentSpotlightAuthor, activeTab, selectedTag, searchQuery, followedAuthorIds]);

  // Unique tags
  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return ['ALL', ...Array.from(set)];
  }, [posts]);

  // Suggested authors to follow
  const suggestedAuthors = useMemo(() => {
    return authors.filter((a) => !followedAuthorIds.some((id) => String(id) === String(a.authorId))).slice(0, 4);
  }, [authors, followedAuthorIds]);

  // Followed author objects
  const followedAuthorsList = useMemo(() => {
    return authors.filter((a) => followedAuthorIds.some((id) => String(id) === String(a.authorId)));
  }, [authors, followedAuthorIds]);

  return (
    <AppLayout breadcrumb="Scholar Social Network">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-indigo">Faculty Network</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Institutional Scholarly Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Scholar Social Network</span>
              <span className="badge-enterprise badge-emerald text-xs">
                {followedAuthorIds.length} Followed Faculty
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Follow fellow researchers, receive automated dispatches on new book publications, and engage in peer discussions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComposeModal(true)}
              className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20 whitespace-nowrap"
            >
              <Plus size={15} /> Broadcast Update
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8 items-start">
          {/* LEFT COLUMN: Scholar Identity & Following Registry */}
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="enterprise-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm border border-slate-200 overflow-hidden flex-shrink-0">
                  {user?.profileUrl ? (
                    <img src={user.profileUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.username || 'Scholar')
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {user?.username || 'Lead Scholar'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {user?.role === 'ADMIN' ? 'Principal Administrator' : 'Academic Researcher'}
                  </p>
                  <span className="badge-enterprise badge-indigo text-[9px] mt-1 py-0 px-1.5">
                    Verified Scholar
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Following</span>
                  <p className="text-base font-extrabold text-indigo-600 mt-0.5">{followedAuthorIds.length}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Publications</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">{books.length || 14}</p>
                </div>
              </div>
            </div>

            {/* Followed Faculty Roster */}
            <div className="enterprise-card p-5 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-indigo-600" />
                  Followed Faculty ({followedAuthorsList.length})
                </h4>
                <Link to="/authors" className="text-[10px] font-bold text-indigo-600 hover:underline">
                  Directory
                </Link>
              </div>

              {followedAuthorsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  You are not following any faculty yet. Discover authors on the right!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {followedAuthorsList.map((author) => (
                    <div
                      key={author.authorId}
                      className={cn(
                        "flex items-center justify-between gap-2 p-2 rounded-xl transition-colors cursor-pointer",
                        selectedAuthorId === String(author.authorId) ? "bg-indigo-50/80 border border-indigo-200" : "hover:bg-slate-50"
                      )}
                      onClick={() => handleSelectAuthor(author.authorId)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img src={author.profileUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600">{author.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{author.department || 'Faculty'}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFollow(author.authorId, author.name);
                        }}
                        className="btn-ghost text-[10px] px-2 py-1 text-slate-400 hover:text-rose-600 flex-shrink-0"
                        title="Unfollow"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Academic Tags */}
            <div className="enterprise-card p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                <Hash size={14} className="text-indigo-600" />
                Research Topics
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTag === tag && tag !== 'ALL') {
                        setSelectedTag('ALL');
                      } else {
                        setSelectedTag(tag);
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all',
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Main Social Feed & Author Dossier */}
          <div className="space-y-6">
            {/* Quick Compose Box */}
            {!selectedAuthorId && (
              <div className="enterprise-card p-5 bg-white space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {getInitials(user?.username || 'You')}
                  </div>
                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="flex-1 text-left px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-400 transition-colors cursor-pointer"
                  >
                    Share research finding, discuss a theorem, or announce publication...
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="btn-ghost text-xs px-3 py-1.5 text-slate-600 gap-1.5"
                  >
                    <BookOpen size={14} className="text-indigo-600" /> Link Catalog Manuscript
                  </button>
                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="btn-accent text-xs px-4 py-1.5 shadow-sm"
                  >
                    <Sparkles size={13} /> Post Update
                  </button>
                </div>
              </div>
            )}

            {/* AUTHOR SPOTLIGHT HERO CARD (When an artist/author is filtered) */}
            {currentSpotlightAuthor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="enterprise-card p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 shadow-md flex-shrink-0">
                        <img
                          src={currentSpotlightAuthor.profileUrl}
                          alt={currentSpotlightAuthor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                            Faculty Profile
                          </span>
                          <span className="text-xs text-indigo-200 font-mono">
                            {authorSpotlightBooks.length} Published Books
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate mt-1">
                          {currentSpotlightAuthor.name}
                        </h2>
                        <p className="text-xs text-indigo-200/80 truncate">
                          {currentSpotlightAuthor.department || 'Academic Contributor'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleFollow(currentSpotlightAuthor.authorId, currentSpotlightAuthor.name)}
                        className={cn(
                          "text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm",
                          followedAuthorIds.some((id) => String(id) === String(currentSpotlightAuthor.authorId))
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-white text-indigo-950 hover:bg-indigo-50"
                        )}
                      >
                        {followedAuthorIds.some((id) => String(id) === String(currentSpotlightAuthor.authorId)) ? (
                          <>
                            <UserCheck size={13} /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus size={13} /> + Follow Artist
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSelectAuthor(null)}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Back to Global Network Feed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-indigo-100/90 leading-relaxed max-w-2xl bg-white/5 p-3 rounded-xl border border-white/10">
                    {currentSpotlightAuthor.bio || 'Verified academic researcher and catalog contributor.'}
                  </p>

                  {/* Sub-tabs for Author: Posts vs Books */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => setAuthorSubTab('posts')}
                      className={cn(
                        "text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                        authorSubTab === 'posts' ? "bg-white text-indigo-950 shadow-sm" : "text-white/70 hover:text-white"
                      )}
                    >
                      <Globe size={13} /> Updates & Posts ({authorSpotlightPosts.length})
                    </button>
                    <button
                      onClick={() => setAuthorSubTab('books')}
                      className={cn(
                        "text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                        authorSubTab === 'books' ? "bg-white text-indigo-950 shadow-sm" : "text-white/70 hover:text-white"
                      )}
                    >
                      <BookOpen size={13} /> Published Books ({authorSpotlightBooks.length})
                    </button>

                    <div className="ml-auto">
                      <button
                        onClick={() => handleSelectAuthor(null)}
                        className="text-[11px] text-indigo-300 hover:text-white underline font-mono"
                      >
                        ← View All Faculty Feed
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Filter Navigation Tabs Bar with Single Unified Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    handleSelectAuthor(null);
                    setActiveTab('all');
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                    activeTab === 'all' && !selectedAuthorId
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  All Feed ({posts.length})
                </button>
                <button
                  onClick={() => {
                    handleSelectAuthor(null);
                    setActiveTab('following');
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                    activeTab === 'following' && !selectedAuthorId
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <UserCheck size={13} /> Following Only
                </button>
                <button
                  onClick={() => {
                    handleSelectAuthor(null);
                    setActiveTab('books');
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                    activeTab === 'books' && !selectedAuthorId
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <BookOpen size={13} /> Book Releases
                </button>
              </div>

              {/* Polished, properly padded Search Bar */}
              <div className="relative w-full sm:w-64 md:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search faculty, topics, posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.35rem', paddingRight: '2rem' }}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                    title="Clear filter"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Active Search Results Banner - No clipping, clean badge */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200/80 text-xs text-indigo-950 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <Search size={14} className="text-indigo-600 flex-shrink-0" />
                  <span className="text-slate-700">
                    Results for <strong className="font-mono text-indigo-950 font-bold">"{searchQuery}"</strong>
                  </span>
                  <span className="bg-indigo-200/70 text-indigo-900 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'update found' : 'updates found'}
                  </span>
                </div>

                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-ghost text-xs px-2.5 py-1 text-indigo-700 hover:text-indigo-950 hover:bg-indigo-100/80 flex items-center gap-1 font-bold rounded-lg flex-shrink-0"
                >
                  <X size={12} /> Clear Filter
                </button>
              </div>
            )}

            {/* IF AUTHOR SPOTLIGHT IS ACTIVE AND 'BOOKS' SUBTAB SELECTED -> SHOW ALL BOOKS BY ARTIST */}
            {selectedAuthorId && authorSubTab === 'books' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600" />
                    Manuscripts & Textbooks Authored by {currentSpotlightAuthor?.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {authorSpotlightBooks.length} Total Volumes
                  </span>
                </div>

                {authorSpotlightBooks.length === 0 ? (
                  <div className="enterprise-card p-12 text-center bg-white space-y-3">
                    <BookOpen size={32} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-extrabold text-slate-800">No catalog books recorded yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {currentSpotlightAuthor?.name} has not linked any published volumes to the catalog. Check their research updates in the other tab!
                    </p>
                    <button onClick={() => setAuthorSubTab('posts')} className="btn-accent text-xs px-4 py-2">
                      View Research Updates
                    </button>
                  </div>
                ) : (
                  authorSpotlightBooks.map((book) => {
                    const isLiked = likedBookIds.some((id) => String(id) === String(book.bookId));
                    const bookComments = bookCommentsMap[String(book.bookId)] || [];
                    const isCommentsOpen = Boolean(expandedBookComments[book.bookId]);

                    return (
                      <motion.div
                        key={book.bookId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="enterprise-card p-6 bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-16 h-22 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm flex-shrink-0">
                              {book.coverUrl ? (
                                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold font-mono">
                                  {book.fileType || 'PDF'}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase', fileTypeColor(book.fileType))}>
                                  {fileTypeLabel(book.fileType)}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {book.pages || 48} pages · {book.category || 'General'}
                                </span>
                              </div>

                              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                                {book.title}
                              </h3>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                                {book.description || 'Academic research publication available in institutional catalog.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                            <Link
                              to={`/reader/${book.bookId}`}
                              className="btn-accent text-xs px-3.5 py-1.5 shadow-sm"
                            >
                              <BookOpen size={13} /> Open Reader
                            </Link>
                            <Link
                              to={`/library/${book.bookId}`}
                              className="btn-ghost text-xs px-3 py-1.5 bg-slate-50 border border-slate-200"
                            >
                              Details
                            </Link>
                          </div>
                        </div>

                        {/* Interactive Book Actions Bar (Like, Comment, Reviews) */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            {/* Like Book Button */}
                            <button
                              onClick={() => handleToggleLikeBook(book.bookId)}
                              className={cn(
                                "btn-ghost text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5",
                                isLiked
                                  ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"
                                  : "text-slate-600 hover:text-rose-600"
                              )}
                            >
                              <Heart size={14} className={cn(isLiked ? "fill-rose-500 text-rose-500" : "")} />
                              <span>{isLiked ? 'Liked Book' : 'Like Book'}</span>
                            </button>

                            {/* Comment on Book Button */}
                            <button
                              onClick={() => toggleBookComments(book.bookId)}
                              className={cn(
                                "btn-ghost text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5",
                                isCommentsOpen ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-indigo-600"
                              )}
                            >
                              <MessageSquare size={14} />
                              <span>Peer Comments ({bookComments.length})</span>
                            </button>
                          </div>

                          <span className="text-[11px] font-mono text-slate-400">
                            Uploaded {formatDate(book.createdAt)}
                          </span>
                        </div>

                        {/* Expandable Book Comments Section */}
                        <AnimatePresence>
                          {isCommentsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-3 border-t border-slate-100 space-y-3 overflow-hidden"
                            >
                              {/* Submit Book Comment */}
                              <form onSubmit={(e) => handleAddBookComment(book.bookId, e)} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  {getInitials(user?.username || 'You')}
                                </div>
                                <input
                                  type="text"
                                  placeholder={`Add a review note on "${book.title}"...`}
                                  value={newBookCommentText[book.bookId] || ''}
                                  onChange={(e) => setNewBookCommentText((prev) => ({ ...prev, [book.bookId]: e.target.value }))}
                                  className="input-base text-xs py-2 rounded-xl flex-1"
                                />
                                <button
                                  type="submit"
                                  disabled={!(newBookCommentText[book.bookId] || '').trim()}
                                  className="btn-accent text-xs px-3 py-2 disabled:opacity-50"
                                >
                                  <Send size={13} />
                                </button>
                              </form>

                              {/* Book Comments List */}
                              {bookComments.length === 0 ? (
                                <p className="text-xs text-slate-400 py-2 text-center">
                                  No comments on this book yet. Start the academic discussion above!
                                </p>
                              ) : (
                                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                                  {bookComments.map((c) => (
                                    <div key={c.commentId} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                                      <div className="flex items-start gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                          {c.user?.profileUrl ? (
                                            <img src={c.user.profileUrl} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="w-full h-full flex items-center justify-center font-bold text-[10px]">
                                              {getInitials(c.user?.username || 'User')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 truncate">{c.user?.username}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{formatRelativeDate(c.createdAt)}</span>
                                          </div>
                                          <p className="text-slate-700 mt-0.5 leading-relaxed">{c.content}</p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => handleDeleteBookComment(book.bookId, c.commentId)}
                                        className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                                        title="Delete comment"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            ) : (
              /* POSTS STREAM */
              <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                  <div className="enterprise-card p-12 text-center bg-white space-y-3">
                    <Search size={32} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-extrabold text-slate-800">
                      {searchQuery ? `No updates matching "${searchQuery}"` : 'No matching research updates'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {searchQuery
                        ? 'Try searching with different keywords, faculty names, or research topics.'
                        : activeTab === 'following'
                        ? 'You are not following any authors who posted in this category. Follow faculty from the recommendations list!'
                        : 'No posts match your current filter criteria.'}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('all');
                        setSelectedTag('ALL');
                        setSearchQuery('');
                        handleSelectAuthor(null);
                      }}
                      className="btn-accent text-xs px-4 py-2"
                    >
                      Reset All Filters & Search
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const isFollowingThisAuthor = followedAuthorIds.some((id) => String(id) === String(post.author?.authorId));
                    const isCommentsOpen = Boolean(expandedComments[post.postId]);
                    const commentsCount = (post.comments || []).length;

                    // Attached book details
                    const attachedBookObj = post.attachedBook;
                    const isAttachedBookLiked = attachedBookObj ? likedBookIds.some((id) => String(id) === String(attachedBookObj.bookId)) : false;
                    const attachedBookComments = attachedBookObj ? (bookCommentsMap[String(attachedBookObj.bookId)] || []) : [];
                    const isAttachedBookCommentsOpen = attachedBookObj ? Boolean(expandedBookComments[attachedBookObj.bookId]) : false;

                    return (
                      <motion.div
                        key={post.postId}
                        id={`post-${post.postId}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="enterprise-card p-6 sm:p-7 bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Author Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                            onClick={() => handleSelectAuthor(post.author?.authorId)}
                          >
                            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-xs group-hover:border-indigo-400 transition-colors">
                              <img
                                src={post.author?.profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                                alt={post.author?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {post.author?.name}
                                </h3>
                                <span className="badge-enterprise badge-indigo text-[10px] py-0 px-1 font-mono">
                                  Faculty
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate leading-snug">
                                {post.author?.department || 'Academic Contributor'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {formatRelativeDate(post.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Follow / Unfollow Action */}
                          <button
                            onClick={() => handleToggleFollow(post.author?.authorId, post.author?.name)}
                            className={cn(
                              'btn-ghost text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 flex-shrink-0',
                              isFollowingThisAuthor
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                            )}
                          >
                            {isFollowingThisAuthor ? (
                              <>
                                <UserCheck size={13} /> Following
                              </>
                            ) : (
                              <>
                                <UserPlus size={13} /> + Follow
                              </>
                            )}
                          </button>
                        </div>

                        {/* Post Content */}
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Hashtags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.tags.map((t) => (
                              <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className="text-xs font-mono font-bold text-indigo-600 hover:underline"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Attached Book Announcement Card */}
                        {attachedBookObj && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 space-y-3">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 shadow-xs">
                                  {attachedBookObj.coverUrl ? (
                                    <img src={attachedBookObj.coverUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold font-mono">
                                      {attachedBookObj.fileType || 'PDF'}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase', fileTypeColor(attachedBookObj.fileType))}>
                                    {fileTypeLabel(attachedBookObj.fileType)} · {attachedBookObj.pages || 48} pages
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                    {attachedBookObj.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {attachedBookObj.description || 'Academic research publication available in catalog.'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                                <Link
                                  to={`/reader/${attachedBookObj.bookId}`}
                                  className="btn-accent text-xs px-3.5 py-1.5 shadow-sm"
                                >
                                  <BookOpen size={13} /> Open Reader
                                </Link>
                                <Link
                                  to={`/library/${attachedBookObj.bookId}`}
                                  className="btn-ghost text-xs px-2.5 py-1.5 bg-white border border-slate-200"
                                >
                                  Details
                                </Link>
                              </div>
                            </div>

                            {/* Book Interaction Bar (Like & Comment for attached book) */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleLikeBook(attachedBookObj.bookId)}
                                  className={cn(
                                    "p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors font-medium",
                                    isAttachedBookLiked
                                      ? "bg-rose-50 text-rose-600 border-rose-200"
                                      : "bg-white text-slate-600 border-slate-200 hover:text-rose-600"
                                  )}
                                  title="Like or favorite this book"
                                >
                                  <Heart size={13} className={cn(isAttachedBookLiked && "fill-rose-500 text-rose-500")} />
                                  <span>{isAttachedBookLiked ? 'Liked' : 'Like Book'}</span>
                                </button>

                                <button
                                  onClick={() => toggleBookComments(attachedBookObj.bookId)}
                                  className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:text-indigo-600 text-xs flex items-center gap-1.5 font-medium transition-colors"
                                >
                                  <MessageSquare size={13} />
                                  <span>Book Reviews ({attachedBookComments.length})</span>
                                </button>
                              </div>

                              <span className="text-[10px] font-mono text-slate-400">
                                Catalog Manuscript
                              </span>
                            </div>

                            {/* Expandable Comments on Attached Book */}
                            <AnimatePresence>
                              {isAttachedBookCommentsOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pt-2 border-t border-slate-200/60 space-y-2 overflow-hidden"
                                >
                                  <form onSubmit={(e) => handleAddBookComment(attachedBookObj.bookId, e)} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Add an evaluation or note on this book..."
                                      value={newBookCommentText[attachedBookObj.bookId] || ''}
                                      onChange={(e) => setNewBookCommentText((prev) => ({ ...prev, [attachedBookObj.bookId]: e.target.value }))}
                                      className="input-base text-xs py-1.5 rounded-xl flex-1 bg-white"
                                    />
                                    <button
                                      type="submit"
                                      disabled={!(newBookCommentText[attachedBookObj.bookId] || '').trim()}
                                      className="btn-accent text-xs px-3 py-1.5 disabled:opacity-50"
                                    >
                                      <Send size={12} />
                                    </button>
                                  </form>

                                  {attachedBookComments.length > 0 && (
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                      {attachedBookComments.map((c) => (
                                        <div key={c.commentId} className="p-2 rounded-lg bg-white border border-slate-200/70 text-xs flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <span className="font-bold text-slate-900">{c.user?.username}: </span>
                                            <span className="text-slate-700">{c.content}</span>
                                          </div>
                                          <button
                                            onClick={() => handleDeleteBookComment(attachedBookObj.bookId, c.commentId)}
                                            className="text-slate-300 hover:text-rose-500 p-0.5"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Social Metric Bar */}
                        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-100">
                          <span>{post.likes} academic reactions</span>
                          <span>{commentsCount} peer review notes</span>
                        </div>

                        {/* Action Buttons Toolbar for the Post */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLikePost(post.postId)}
                              className={cn(
                                'btn-ghost text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold',
                                post.likedByMe
                                  ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                                  : 'text-slate-600 hover:text-indigo-600'
                              )}
                            >
                              <ThumbsUp size={14} className={cn(post.likedByMe && 'fill-indigo-600')} />
                              <span>{post.likedByMe ? 'Reacted' : 'React'}</span>
                            </button>

                            <button
                              onClick={() => togglePostComments(post.postId)}
                              className={cn(
                                'btn-ghost text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold',
                                isCommentsOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
                              )}
                            >
                              <MessageSquare size={14} />
                              <span>Comment ({commentsCount})</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleShare(post.postId)}
                            className="btn-ghost text-xs px-2.5 py-1.5 text-slate-400 hover:text-slate-600 flex items-center gap-1 font-mono"
                            title="Copy citation link"
                          >
                            {copiedPostId === post.postId ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <Check size={12} /> Copied
                              </span>
                            ) : (
                              <>
                                <Share2 size={13} />
                                <span>Cite</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Expandable Post Comments Thread */}
                        <AnimatePresence>
                          {isCommentsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-slate-100 space-y-4 overflow-hidden"
                            >
                              {/* Submit New Comment Form */}
                              <form onSubmit={(e) => handleAddPostComment(post.postId, e)} className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  {getInitials(user?.username || 'You')}
                                </div>
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    placeholder="Contribute to this peer research discussion..."
                                    value={newCommentText[post.postId] || ''}
                                    onChange={(e) => setNewCommentText((prev) => ({ ...prev, [post.postId]: e.target.value }))}
                                    className="input-base text-xs pr-10 py-2 rounded-xl"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!(newCommentText[post.postId] || '').trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:hover:text-indigo-600"
                                  >
                                    <Send size={14} />
                                  </button>
                                </div>
                              </form>

                              {/* Comments Stream */}
                              <div className="space-y-2.5">
                                {(post.comments || []).length === 0 ? (
                                  <p className="text-xs text-slate-400 py-2 text-center">
                                    No peer notes yet. Be the first scholar to reply!
                                  </p>
                                ) : (
                                  post.comments.map((comment) => (
                                    <div
                                      key={comment.commentId}
                                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                            {comment.user?.profileUrl ? (
                                              <img src={comment.user.profileUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <span className="w-full h-full flex items-center justify-center font-bold text-[9px]">
                                                {getInitials(comment.user?.username || 'User')}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-xs font-bold text-slate-900">{comment.user?.username}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {formatRelativeDate(comment.createdAt)}
                                          </span>
                                        </div>

                                        <button
                                          onClick={() => handleDeletePostComment(post.postId, comment.commentId)}
                                          className="text-slate-300 hover:text-rose-600 p-1 rounded-md"
                                          title="Remove note"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>

                                      <p className="text-xs text-slate-700 leading-relaxed pl-8">
                                        {comment.content}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Recommended Faculty & Book Releases */}
          <div className="space-y-6">
            {/* Faculty Recommendations to Follow */}
            <div className="enterprise-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                  <UserPlus size={14} className="text-indigo-600" />
                  Recommended Faculty
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Discover</span>
              </div>

              <div className="space-y-3.5">
                {suggestedAuthors.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    You are following all featured faculty members!
                  </p>
                ) : (
                  suggestedAuthors.map((author) => (
                    <div
                      key={author.authorId}
                      className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleSelectAuthor(author.authorId)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-xs">
                          <img src={author.profileUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600">{author.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{author.department || 'Professor'}</p>
                          <span className="text-[9px] font-mono text-indigo-600">{author.publicationsCount || 8} works</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFollow(author.authorId, author.name);
                        }}
                        className="btn-accent text-[11px] px-3 py-1.5 shadow-xs flex-shrink-0"
                      >
                        + Follow
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Latest Library Books */}
            <div className="enterprise-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-600" />
                  Recent Publications
                </h3>
                <Link to="/library" className="text-[10px] font-bold text-indigo-600 hover:underline">
                  All
                </Link>
              </div>

              <div className="space-y-3">
                {books.slice(0, 3).map((b) => (
                  <Link
                    key={b.bookId}
                    to={`/library/${b.bookId}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group block"
                  >
                    <div className="w-9 h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      {b.coverUrl ? (
                        <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={16} className="m-auto text-slate-400 mt-2" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        By {typeof b.author === 'object' ? b.author?.name : b.author || 'Faculty'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Academic Integrity Code */}
            <div className="enterprise-card p-4 bg-slate-50/70 text-xs text-slate-500 space-y-2 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <ShieldCheck size={14} className="text-indigo-600" />
                <span>Peer-Review Network Standard</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                All posts, citation links, and paper announcements are monitored according to institutional research ethics and university publishing guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Research Update Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComposeModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-slate-200 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="badge-enterprise badge-indigo">Broadcast Post</span>
                  <span className="text-xs font-mono text-slate-400">Scholar Network</span>
                </div>
                <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePublishPost} className="space-y-4">
                {/* Author Voice Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Publish As Faculty Persona
                  </label>
                  <select
                    value={postingAuthorId}
                    onChange={(e) => setPostingAuthorId(e.target.value)}
                    className="input-base text-xs cursor-pointer"
                  >
                    {authors.map((a) => (
                      <option key={a.authorId} value={a.authorId}>
                        {a.name} ({a.department || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Post Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Research Abstract or Update <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share a theorem proof, explain a new textbook release, or present seminar findings to your followers..."
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    className="input-base text-xs resize-none"
                  />
                </div>

                {/* Attach Catalog Manuscript */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Attach Catalog Document / Manuscript (Optional)
                  </label>
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="input-base text-xs cursor-pointer"
                  >
                    <option value="">No Book Attached (Text Update Only)</option>
                    {books.map((b) => (
                      <option key={b.bookId} value={b.bookId}>
                        {b.title} ({b.fileType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Topic Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="DistributedSystems, CloudArchitecture, Consensus"
                    value={composeTags}
                    onChange={(e) => setComposeTags(e.target.value)}
                    className="input-base text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publishing || !composeText.trim()}
                    className="btn-accent text-xs px-5 py-2 shadow-sm disabled:opacity-50"
                  >
                    {publishing ? 'Broadcasting...' : 'Publish to Network'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
