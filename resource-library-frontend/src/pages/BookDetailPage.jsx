import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, FileText, Star, User, Calendar,
  Hash, ExternalLink, Send, Trash2, AlertCircle, ChevronDown,
  Layers, MessageSquare, Download, Share2, CheckCircle2, Clock,
  Edit3, PlusCircle, Check, X, Shield, Upload
} from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  getBookById, getBookVersions, activateBookVersion,
  updateBook, createBookVersion, deleteBook
} from '../api/books';
import { getAllComments, postComment, deleteComment } from '../api/comments';
import { uploadFile } from '../api/files';
import { getAuthors } from '../api/authors';
import { AppSidebar } from '../components/layout/AppSidebar';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  cn, fileTypeLabel, fileTypeColor, coverGradient,
  formatDate, formatRelativeDate, getInitials
} from '../lib/utils';
import { CoverImage } from '../components/resources/ResourceCard';

const FILE_TYPES = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'TXT', 'OTHER'];

export default function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [book, setBook] = useState(null);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | versions | comments

  // Owner action modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPages, setEditPages] = useState(1);
  const [editAuthor, setEditAuthor] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // New version form state
  const [verTitle, setVerTitle] = useState('');
  const [verDesc, setVerDesc] = useState('');
  const [verPages, setVerPages] = useState(1);
  const [verFileType, setVerFileType] = useState('PDF');
  const [verFile, setVerFile] = useState(null);
  const [verFileUploading, setVerFileUploading] = useState(false);
  const [verFileUrl, setVerFileUrl] = useState('');
  const [verLoading, setVerLoading] = useState(false);
  const [verError, setVerError] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  function loadBookData() {
    setLoading(true);
    setError(null);
    getBookById(bookId)
      .then((res) => {
        if (res.success) {
          const b = res.data;
          setBook(b);
          setEditTitle(b.title || '');
          setEditDesc(b.description || '');
          setEditPages(b.pages || 1);
          setEditAuthor(b.author?.authorId || '');

          setVerTitle(b.title || '');
          setVerDesc(b.description || '');
          setVerPages(b.pages || 1);
          setVerFileType(b.fileType || 'PDF');

          if (b.rootBookId) {
            getBookVersions(b.rootBookId)
              .then((vRes) => { if (vRes.success) setVersions(vRes.data || []); })
              .catch(() => {});
          }
        } else {
          setError(res.message || 'Book not found.');
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load resource details.'))
      .finally(() => setLoading(false));

    getAllComments()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setComments(res.data);
        }
      })
      .catch(() => {});

    getAuthors()
      .then((res) => { if (res.success) setAuthors(res.data || []); })
      .catch(() => {});
  }

  useEffect(() => {
    loadBookData();
  }, [bookId]);

  // Check if current logged-in user is the owner/uploader
  const isOwner = Boolean(
    user?.username &&
    book?.uploadedBy?.username &&
    user.username === book.uploadedBy.username
  );

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        pages: Number(editPages),
      };
      if (editAuthor) payload.author = Number(editAuthor);
      const res = await updateBook(book.bookId, payload);
      if (res.success) {
        setShowEditModal(false);
        loadBookData();
      } else {
        setEditError(res.message || 'Failed to update book.');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update book.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleUploadVersionFile(file) {
    setVerFile(file);
    setVerFileUploading(true);
    setVerError('');
    try {
      const res = await uploadFile(file);
      if (res.success) setVerFileUrl(res.data);
      else setVerError(res.message || 'File upload failed');
    } catch (err) {
      setVerError(err.response?.data?.message || 'File upload failed');
    } finally {
      setVerFileUploading(false);
    }
  }

  async function handleNewVersionSubmit(e) {
    e.preventDefault();
    if (!verFileUrl) {
      setVerError('Please upload the new version document file.');
      return;
    }
    if (!user?.userId) {
      setVerError('Please sign in to upload version.');
      return;
    }
    setVerLoading(true);
    setVerError('');
    try {
      const targetRootId = book.rootBookId || book.bookId;
      const payload = {
        title: verTitle.trim() || book.title,
        description: verDesc.trim() || book.description,
        pages: Number(verPages),
        fileType: verFileType,
        fileUrl: verFileUrl,
        author: book.author?.authorId || authors[0]?.authorId || 1,
        uploadedBy: user.userId,
      };
      const res = await createBookVersion(targetRootId, payload);
      if (res.success) {
        setShowVersionModal(false);
        loadBookData();
        setActiveTab('versions');
      } else {
        setVerError(res.message || 'Failed to create new version.');
      }
    } catch (err) {
      setVerError(err.response?.data?.message || 'Failed to create new version.');
    } finally {
      setVerLoading(false);
    }
  }

  async function handleActivateVersion(versionBookId) {
    try {
      const res = await activateBookVersion(versionBookId);
      if (res.success) {
        loadBookData();
      }
    } catch {}
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to permanently delete this resource?')) return;
    try {
      const res = await deleteBook(book.bookId);
      if (res.success) {
        navigate('/library');
      }
    } catch {}
  }

  async function handlePostComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user?.userId) {
      setCommentError('Please sign in to comment.');
      return;
    }
    setCommentLoading(true);
    setCommentError('');
    try {
      const res = await postComment(bookId, user.userId, { content: commentText.trim() });
      if (res.success) {
        setCommentText('');
        getAllComments().then((r) => { if (r.success) setComments(r.data || []); });
      } else {
        setCommentError(res.message || 'Failed to post comment.');
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAF9F6]">
        <div className="hidden lg:block"><AppSidebar /></div>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Loading resource details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen bg-[#FAF9F6]">
        <div className="hidden lg:block"><AppSidebar /></div>
        <main className="flex-1 flex items-center justify-center p-8">
          <ErrorState message={error || 'Resource not found'} onRetry={() => window.location.reload()} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      <div className="hidden lg:block"><AppSidebar /></div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar Bar */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => navigate('/library')}
            className="btn-ghost text-xs px-3 py-1.5 gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Library
          </button>

          <div className="flex items-center gap-2.5">
            {/* General Actions for all users (Read / Download) */}
            {book.fileUrl && (
              <a
                href={book.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs px-3 py-1.5"
                title="Download / Open Source File"
              >
                <Download size={13} /> Download S3 File
              </a>
            )}
            <Link
              to={`/reader/${book.bookId}`}
              className="btn-accent text-xs px-4 py-1.5 shadow-md shadow-indigo-500/20"
            >
              <BookOpen size={13} /> Launch Reader
            </Link>

            {/* Owner-Specific Quick Action Buttons */}
            {isOwner && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setShowVersionModal(true)}
                  className="btn-accent text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm border-emerald-700"
                  title="Upload a new document revision"
                >
                  <PlusCircle size={13} /> New Version
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-ghost text-xs px-3 py-1.5"
                  title="Edit resource metadata"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Header Area */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-start">
              {/* Book Cover */}
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 max-w-[220px] mx-auto md:mx-0 w-full">
                <CoverImage book={book} size="lg" />
              </div>

              {/* Header Details */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={cn('px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase', fileTypeColor(book.fileType))}>
                      {fileTypeLabel(book.fileType)}
                    </span>
                    {book.version && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                        VERSION {book.version}.0
                      </span>
                    )}
                    {book.isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                        Active Edition
                      </span>
                    )}
                    {isOwner ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60 flex items-center gap-1 font-mono">
                        <Shield size={11} /> You are the Uploader
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-mono">
                        Read-Only Access
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                    {book.title}
                  </h1>

                  {book.author && (
                    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/60 max-w-md">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                        {book.author.profileUrl ? (
                          <img src={book.author.profileUrl} alt={book.author.name} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          getInitials(book.author.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {book.author.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate leading-snug">
                          {book.author.bio || 'Verified Author & Contributor'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata badges strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100 font-mono">
                  {book.pages && (
                    <span className="flex items-center gap-1.5">
                      <Hash size={13} className="text-slate-400" />
                      {book.pages} Pages
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    Uploaded {formatDate(book.createdAt)}
                  </span>
                  {book.uploadedBy && (
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      Uploaded by {book.uploadedBy.username || 'Community'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center gap-2">
            {[
              { id: 'overview', label: 'Document Overview', icon: FileText },
              { id: 'versions', label: `Version History (${versions.length || 1})`, icon: Layers },
              { id: 'comments', label: `Discussion (${comments.length})`, icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer',
                  activeTab === id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 w-full flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl p-6 bg-white">
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
                    Description & Summary
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {book.description || 'No detailed description provided for this resource.'}
                  </p>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-5 bg-white space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-2">
                    Access Resource
                  </h4>
                  <Link
                    to={`/reader/${book.bookId}`}
                    className="btn-accent w-full text-xs py-2.5 shadow-sm"
                  >
                    <BookOpen size={14} /> Open Fullscreen Reader
                  </Link>
                  {book.fileUrl && (
                    <a
                      href={book.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost w-full text-xs py-2.5"
                    >
                      <Download size={14} /> Direct File Download
                    </a>
                  )}

                  {/* Owner-Only Management Section */}
                  {isOwner && (
                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold text-indigo-700 uppercase font-mono tracking-wider">
                        Uploader Management
                      </p>
                      <button
                        onClick={() => setShowVersionModal(true)}
                        className="btn-ghost w-full text-xs py-2 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      >
                        <PlusCircle size={13} /> Upload New Version
                      </button>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="btn-ghost w-full text-xs py-2"
                      >
                        <Edit3 size={13} /> Edit Title & Description
                      </button>
                      <button
                        onClick={handleDelete}
                        className="btn-ghost w-full text-xs py-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        <Trash2 size={13} /> Delete Resource
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERSIONS TIMELINE */}
          {activeTab === 'versions' && (
            <div className="max-w-3xl glass-card rounded-2xl p-6 bg-white">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Document Version History
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isOwner ? 'You can add new editions and switch the active published version.' : 'Explore and read prior revisions of this document.'}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowVersionModal(true)}
                    className="btn-accent text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  >
                    <PlusCircle size={13} /> Add Version
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {versions.map((v) => (
                  <div key={v.bookId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        v{v.version}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{v.title}</p>
                          {v.isCurrent && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80">
                              Active Edition
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {formatDate(v.createdAt)} {v.pages ? `· ${v.pages} pages` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/reader/${v.bookId}`}
                        className="btn-ghost text-xs px-3 py-1.5 gap-1"
                        title="Read this version"
                      >
                        <BookOpen size={12} /> Read
                      </Link>

                      {/* Owner can activate this version as current */}
                      {isOwner && !v.isCurrent && (
                        <button
                          onClick={() => handleActivateVersion(v.bookId)}
                          className="btn-ghost text-xs px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700"
                        >
                          <Check size={12} /> Make Active
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DISCUSSION & COMMENTS */}
          {activeTab === 'comments' && (
            <div className="max-w-3xl space-y-6">
              <form onSubmit={handlePostComment} className="glass-card rounded-2xl p-5 bg-white">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
                  Leave a Note or Comment
                </h4>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share a thought, ask a question, or leave feedback..."
                  rows={3}
                  className="input-base text-xs rounded-xl resize-none"
                  disabled={commentLoading}
                />
                {commentError && (
                  <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {commentError}
                  </p>
                )}
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className="btn-accent text-xs px-4 py-2 disabled:opacity-50"
                  >
                    <Send size={13} /> {commentLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">
                    No comments yet. Be the first to start the conversation!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.commentId} className="glass-card rounded-2xl p-4 bg-white flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {getInitials(c.user?.username || 'User')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{c.user?.username || 'Member'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatRelativeDate(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                      </div>
                      {user?.userId && c.user?.userId === user.userId && (
                        <button
                          onClick={() => handleDeleteComment(c.commentId)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete Comment"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── MODAL: EDIT BOOK DETAILS (OWNER ONLY) ─────────────────────────── */}
        {showEditModal && isOwner && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Resource Details</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="input-base text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Pages</label>
                    <input
                      type="number"
                      min={1}
                      value={editPages}
                      onChange={(e) => setEditPages(e.target.value)}
                      className="input-base text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Author</label>
                    <select
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      className="input-base text-xs cursor-pointer"
                    >
                      <option value="">Keep Existing</option>
                      {authors.map((a) => (
                        <option key={a.authorId} value={a.authorId}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || !editTitle.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: UPLOAD NEW VERSION (OWNER ONLY) ─────────────────────────── */}
        {showVersionModal && isOwner && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Upload New Revision</h3>
                  <p className="text-xs text-slate-500">Create version {((book.version || 1) + 1)}.0 of this document</p>
                </div>
                <button onClick={() => setShowVersionModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              {verError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4">
                  {verError}
                </div>
              )}

              <form onSubmit={handleNewVersionSubmit} className="space-y-4">
                {/* File Drop Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                    Updated Document File <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors p-5 text-center bg-slate-50/60 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                      onChange={(e) => e.target.files?.[0] && handleUploadVersionFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    {verFileUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-xs text-slate-500">Uploading new revision to S3...</p>
                      </div>
                    ) : verFileUrl ? (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <CheckCircle2 size={22} className="text-emerald-500" />
                        <p className="text-xs font-bold text-emerald-700">{verFile?.name || 'File Attached'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload size={20} className="text-slate-400" />
                        <p className="text-xs font-bold text-slate-700">Choose Revised File</p>
                        <p className="text-[10px] text-slate-400 font-mono">PDF, DOCX, PPTX</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Title</label>
                  <input
                    type="text"
                    value={verTitle}
                    onChange={(e) => setVerTitle(e.target.value)}
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">File Type</label>
                    <select
                      value={verFileType}
                      onChange={(e) => setVerFileType(e.target.value)}
                      className="input-base text-xs"
                    >
                      {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Pages</label>
                    <input
                      type="number"
                      min={1}
                      value={verPages}
                      onChange={(e) => setVerPages(e.target.value)}
                      className="input-base text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowVersionModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verLoading || verFileUploading || !verFileUrl}
                    className="btn-accent text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {verLoading ? 'Publishing Revision...' : 'Publish New Version'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
