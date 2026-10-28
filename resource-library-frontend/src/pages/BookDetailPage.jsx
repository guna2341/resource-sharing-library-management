import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, FileText, Star, User, Calendar,
  Hash, ExternalLink, Send, Trash2, AlertCircle, ChevronDown,
  Layers, MessageSquare, Download, Share2, CheckCircle2, Clock,
  Edit3, PlusCircle, Check, X, Shield, Upload, Image as ImageIcon, Camera, Plus, UserPlus,
  Heart, Bookmark, StarHalf
} from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  getBookById, getBookVersions, activateBookVersion,
  updateBook, createBookVersion, deleteBook, recordBookDownload
} from '../api/books';
import { getAllComments, postComment, deleteComment } from '../api/comments';
import { getRatings, getUserRating, postRating, updateRating, deleteRating } from '../api/ratings';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
import { getBookmarksByBookId, addBookmark, removeBookmark } from '../api/bookmarks';
import { uploadFile } from '../api/files';
import { getAuthors, createAuthor, updateAuthor } from '../api/authors';
import { networkApi } from '../api/network';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  cn, fileTypeLabel, fileTypeColor, coverGradient,
  formatDate, formatRelativeDate, getInitials,
  DEFAULT_BOOK_COVER, DEFAULT_AUTHOR_AVATAR, getBookCover, getAuthorAvatar
} from '../lib/utils';
import { CoverImage } from '../components/resources/ResourceCard';
import { SimilarResources } from '../components/recommendations/SimilarResources';

const FILE_TYPES = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'TXT', 'OTHER'];

export default function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [book, setBook] = useState(null);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [followedAuthorIds, setFollowedAuthorIds] = useState(networkApi.getFollowedAuthorIds());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | versions | comments

  function handleToggleFollowAuthor(authorId, authorName) {
    if (!authorId) return;
    networkApi.toggleFollow(authorId, authorName);
    setFollowedAuthorIds(networkApi.getFollowedAuthorIds());
  }

  // Owner action modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editVersionTarget, setEditVersionTarget] = useState(null); // specific version being edited

  // Author edit modal state
  const [showEditAuthorModal, setShowEditAuthorModal] = useState(false);
  const [authorEditTarget, setAuthorEditTarget] = useState(null);
  const [authorEditName, setAuthorEditName] = useState('');
  const [authorEditBio, setAuthorEditBio] = useState('');
  const [authorEditProfileUrl, setAuthorEditProfileUrl] = useState('');
  const [authorEditProfileUploading, setAuthorEditProfileUploading] = useState(false);
  const [authorEditLoading, setAuthorEditLoading] = useState(false);
  const [authorEditError, setAuthorEditError] = useState('');

  // Quick author create in edit modal
  const [showCreateAuthorInModal, setShowCreateAuthorInModal] = useState(false);
  const [quickAuthorName, setQuickAuthorName] = useState('');
  const [quickAuthorBio, setQuickAuthorBio] = useState('');
  const [quickAuthorProfileUrl, setQuickAuthorProfileUrl] = useState('');
  const [quickAuthorProfileUploading, setQuickAuthorProfileUploading] = useState(false);
  const [quickAuthorLoading, setQuickAuthorLoading] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPages, setEditPages] = useState(1);
  const [editAuthor, setEditAuthor] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverUploading, setEditCoverUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // New version form state
  const [verTitle, setVerTitle] = useState('');
  const [verDesc, setVerDesc] = useState('');
  const [verPages, setVerPages] = useState(1);
  const [verFileType, setVerFileType] = useState('PDF');
  const [verCoverUrl, setVerCoverUrl] = useState('');
  const [verCoverFile, setVerCoverFile] = useState(null);
  const [verCoverUploading, setVerCoverUploading] = useState(false);
  const [verFile, setVerFile] = useState(null);
  const [verFileUploading, setVerFileUploading] = useState(false);
  const [verFileUrl, setVerFileUrl] = useState('');
  const [verLoading, setVerLoading] = useState(false);
  const [verError, setVerError] = useState('');

  // Edit specific version form state
  const [verEditTitle, setVerEditTitle] = useState('');
  const [verEditDesc, setVerEditDesc] = useState('');
  const [verEditPages, setVerEditPages] = useState(1);
  const [verEditCoverUrl, setVerEditCoverUrl] = useState('');
  const [verEditCoverFile, setVerEditCoverFile] = useState(null);
  const [verEditCoverUploading, setVerEditCoverUploading] = useState(false);
  const [verEditLoading, setVerEditLoading] = useState(false);
  const [verEditError, setVerEditError] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Ratings state
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [selectedStar, setSelectedStar] = useState(5);
  const [ratingReviewText, setRatingReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Wishlist state
  const [wishlistId, setWishlistId] = useState(null);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // Bookmark state
  const [bookmarks, setBookmarks] = useState([]);
  const [newBookmarkPage, setNewBookmarkPage] = useState(1);
  const [addingBookmark, setAddingBookmark] = useState(false);

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
          setEditCoverUrl(b.coverUrl || '');

          setVerTitle(b.title || '');
          setVerDesc(b.description || '');
          setVerPages(b.pages || 1);
          setVerFileType(b.fileType || 'PDF');
          setVerCoverUrl(b.coverUrl || '');

          const targetRootId = b.rootBookId || b.bookId;
          if (targetRootId) {
            getBookVersions(targetRootId)
              .then((vRes) => {
                if (vRes.success && Array.isArray(vRes.data)) {
                  setVersions(vRes.data);
                }
              })
              .catch((err) => {
                console.error('Failed to fetch versions:', err);
              });
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

    getRatings(bookId)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setRatings(res.data);
      })
      .catch(() => {});

    if (user?.userId) {
      getUserRating(user.userId, bookId)
        .then((res) => {
          if (res.success && res.data) {
            setUserRating(res.data);
            setSelectedStar(res.data.rating || 5);
            setRatingReviewText(res.data.review || '');
          }
        })
        .catch(() => {});

      getWishlist(user.userId)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const found = res.data.find((item) => (item.book?.bookId || item.bookId) === Number(bookId));
            setWishlistId(found?.wishlistId || null);
          }
        })
        .catch(() => {});

      getBookmarksByBookId(user.userId, bookId)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setBookmarks(res.data);
          }
        })
        .catch(() => {});
    }
  }

  useEffect(() => {
    loadBookData();
  }, [bookId, user?.userId]);

  // Check if current logged-in user is the owner/uploader or admin
  const isOwner = Boolean(
    user?.userId &&
    book &&
    (
      String(typeof book.uploadedBy === 'object' ? (book.uploadedBy?.userId || book.uploadedBy?.username) : book.uploadedBy) === String(user.userId || user.username) ||
      user?.role === 'ADMIN' ||
      user?.role === 'ROLE_ADMIN' ||
      user?.username === 'admin'
    )
  );

  async function handleUploadEditCover(file) {
    setEditCoverFile(file);
    setEditCoverUploading(true);
    setEditError('');
    try {
      const res = await uploadFile(file);
      if (res.success) setEditCoverUrl(res.data);
      else setEditError(res.message || 'Cover image upload failed');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Cover image upload failed');
    } finally {
      setEditCoverUploading(false);
    }
  }

  async function handleUploadVersionCover(file) {
    setVerCoverFile(file);
    setVerCoverUploading(true);
    setVerError('');
    try {
      const res = await uploadFile(file);
      if (res.success) setVerCoverUrl(res.data);
      else setVerError(res.message || 'Cover image upload failed');
    } catch (err) {
      setVerError(err.response?.data?.message || 'Cover image upload failed');
    } finally {
      setVerCoverUploading(false);
    }
  }

  async function handleUploadTargetVersionCover(file) {
    setVerEditCoverFile(file);
    setVerEditCoverUploading(true);
    setVerEditError('');
    try {
      const res = await uploadFile(file);
      if (res.success) setVerEditCoverUrl(res.data);
      else setVerEditError(res.message || 'Cover image upload failed');
    } catch (err) {
      setVerEditError(err.response?.data?.message || 'Cover image upload failed');
    } finally {
      setVerEditCoverUploading(false);
    }
  }

  function handleOpenEditVersionModal(versionItem) {
    setEditVersionTarget(versionItem);
    setVerEditTitle(versionItem.title || '');
    setVerEditDesc(versionItem.description || '');
    setVerEditPages(versionItem.pages || 1);
    setVerEditCoverUrl(versionItem.coverUrl || '');
    setVerEditCoverFile(null);
    setVerEditError('');
  }

  async function handleEditVersionSubmit(e) {
    e.preventDefault();
    if (!editVersionTarget) return;
    if (!verEditTitle.trim()) return;
    setVerEditLoading(true);
    setVerEditError('');
    try {
      const payload = {
        title: verEditTitle.trim(),
        description: verEditDesc.trim(),
        pages: Number(verEditPages),
        coverUrl: verEditCoverUrl || '',
      };
      const res = await updateBook(editVersionTarget.bookId, payload);
      if (res.success) {
        setEditVersionTarget(null);
        loadBookData();
      } else {
        setVerEditError(res.message || 'Failed to update edition.');
      }
    } catch (err) {
      setVerEditError(err.response?.data?.message || 'Failed to update edition.');
    } finally {
      setVerEditLoading(false);
    }
  }

  function handleOpenEditAuthor(authorObj) {
    const targetAuthor = authorObj || book?.author;
    if (!targetAuthor) return;
    setAuthorEditTarget(targetAuthor);
    setAuthorEditName(targetAuthor.name || '');
    setAuthorEditBio(targetAuthor.bio || '');
    setAuthorEditProfileUrl(targetAuthor.profileUrl || '');
    setAuthorEditError('');
    setShowEditAuthorModal(true);
  }

  async function handleAuthorAvatarUpload(file) {
    if (!file) return;
    setAuthorEditProfileUploading(true);
    setAuthorEditError('');
    try {
      const res = await uploadFile(file);
      if (res.success && res.data) {
        setAuthorEditProfileUrl(res.data);
      }
    } catch {
      setAuthorEditError('Failed to upload author avatar.');
    } finally {
      setAuthorEditProfileUploading(false);
    }
  }

  async function handleSaveAuthor(e) {
    e.preventDefault();
    const targetId = authorEditTarget?.authorId || book?.author?.authorId;
    if (!authorEditName.trim() || !targetId) return;
    setAuthorEditLoading(true);
    setAuthorEditError('');
    try {
      const payload = {
        name: authorEditName.trim(),
        bio: authorEditBio.trim(),
        profileUrl: authorEditProfileUrl || DEFAULT_AUTHOR_AVATAR,
      };
      const res = await updateAuthor(targetId, payload);
      if (res.success) {
        setShowEditAuthorModal(false);
        // Refresh local book if it was this book's author
        if (book?.author?.authorId === targetId) {
          setBook((prev) => prev ? { ...prev, author: { ...prev.author, ...payload } } : prev);
        }
        // Refresh authors dropdown
        getAuthors().then((r) => r.success && setAuthors(r.data));
      } else {
        setAuthorEditError(res.message || 'Failed to update author.');
      }
    } catch (err) {
      setAuthorEditError(err.response?.data?.message || 'Failed to update author.');
    } finally {
      setAuthorEditLoading(false);
    }
  }

  async function handleQuickAuthorAvatarUpload(file) {
    if (!file) return;
    setQuickAuthorProfileUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.success && res.data) {
        setQuickAuthorProfileUrl(res.data);
      }
    } catch {}
    finally {
      setQuickAuthorProfileUploading(false);
    }
  }

  async function handleQuickCreateAuthor(e) {
    e.preventDefault();
    if (!quickAuthorName.trim()) return;
    setQuickAuthorLoading(true);
    try {
      const payload = {
        name: quickAuthorName.trim(),
        bio: quickAuthorBio.trim(),
        profileUrl: quickAuthorProfileUrl || DEFAULT_AUTHOR_AVATAR,
      };
      const res = await createAuthor(payload);
      if (res.success && res.data) {
        const created = res.data;
        setAuthors((prev) => [...prev, created]);
        setEditAuthor(created.authorId);
        setShowCreateAuthorInModal(false);
        setQuickAuthorName('');
        setQuickAuthorBio('');
        setQuickAuthorProfileUrl('');
      }
    } catch {}
    finally {
      setQuickAuthorLoading(false);
    }
  }

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
        coverUrl: editCoverUrl || '',
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
        coverUrl: verCoverUrl || book.coverUrl || '',
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

  async function handleToggleWishlist() {
    if (!user?.userId) {
      alert('Please sign in to save books to your wishlist.');
      return;
    }
    setTogglingWishlist(true);
    try {
      if (wishlistId) {
        await removeFromWishlist(wishlistId);
        setWishlistId(null);
      } else {
        const res = await addToWishlist(user.userId, book.bookId);
        if (res.success && res.data?.wishlistId) {
          setWishlistId(res.data.wishlistId);
        } else {
          loadBookData();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingWishlist(false);
    }
  }

  async function handleSubmitRating(e) {
    e.preventDefault();
    if (!user?.userId) {
      setRatingError('Please sign in to submit a rating.');
      return;
    }
    setRatingLoading(true);
    setRatingError('');
    try {
      const payload = {
        rating: Number(selectedStar),
        review: ratingReviewText.trim(),
      };
      let res;
      if (userRating?.ratingId) {
        res = await updateRating(userRating.ratingId, payload);
      } else {
        res = await postRating(book.bookId, user.userId, payload);
      }
      if (res.success) {
        setUserRating(res.data || { ...payload, ratingId: userRating?.ratingId || 1 });
        getRatings(book.bookId).then((r) => { if (r.success) setRatings(r.data || []); });
      } else {
        setRatingError(res.message || 'Failed to submit rating.');
      }
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingLoading(false);
    }
  }

  async function handleDeleteRating() {
    if (!confirm('Are you sure you want to delete your review?')) return;
    try {
      await deleteRating(book.bookId);
      setUserRating(null);
      setRatingReviewText('');
      getRatings(book.bookId).then((r) => { if (r.success) setRatings(r.data || []); });
    } catch {}
  }

  async function handleAddBookmark(e) {
    e.preventDefault();
    if (!user?.userId) return;
    setAddingBookmark(true);
    try {
      const res = await addBookmark(user.userId, book.bookId, { page: Number(newBookmarkPage) });
      if (res.success) {
        getBookmarksByBookId(user.userId, book.bookId).then((r) => {
          if (r.success && Array.isArray(r.data)) setBookmarks(r.data);
        });
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


  if (loading) {
    return (
      <AppLayout breadcrumb="Resource Details">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Loading resource details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !book) {
    return (
      <AppLayout breadcrumb="Resource Details">
        <div className="flex-1 flex items-center justify-center p-8">
          <ErrorState message={error || 'Resource not found'} onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumb={book?.title || 'Resource Details'}>
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar Bar */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => navigate('/library')}
            className="btn-ghost text-xs px-3 py-1.5 gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Library
          </button>

          <div className="flex items-center gap-2.5">
            {/* Wishlist button */}
            <button
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
              className={cn(
                'btn-ghost text-xs px-3 py-1.5 gap-1.5 transition-colors',
                wishlistId ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100' : 'text-slate-600'
              )}
              title={wishlistId ? 'Saved in your wishlist' : 'Save to wishlist'}
            >
              <Heart size={14} className={cn(wishlistId ? 'fill-rose-500 text-rose-500' : 'text-slate-400')} />
              <span>{wishlistId ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>

            {/* General Actions for all users (Read / Download) */}
            {book.fileUrl && (
              <a
                href={book.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (user?.userId && book?.bookId) {
                    recordBookDownload(book.bookId, user.userId).catch(() => {});
                  }
                }}
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
              {/* Book Cover with Owner Hover Edit */}
              <div className="relative group rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 max-w-[220px] mx-auto md:mx-0 w-full bg-slate-900">
                <CoverImage book={book} size="lg" />
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white text-xs font-semibold cursor-pointer backdrop-blur-[2px]"
                    title="Change Book Cover Image"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </div>
                    <span>Change Cover</span>
                  </button>
                )}
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
                    <div className="flex items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-lg shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 border border-slate-200">
                          <img
                            src={getAuthorAvatar(typeof book.author === 'object' ? book.author?.profileUrl : null)}
                            alt={typeof book.author === 'object' ? (book.author?.name || 'Author') : String(book.author)}
                            onError={(e) => {
                              if (e.currentTarget.src !== DEFAULT_AUTHOR_AVATAR) {
                                e.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-snug truncate">
                            {typeof book.author === 'object' ? (book.author?.name || 'Academic Scholar') : String(book.author)}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate leading-snug">
                            {typeof book.author === 'object' ? (book.author?.bio || 'Verified Author & Contributor') : 'Verified Faculty Author'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {(() => {
                          const authorId = typeof book.author === 'object' ? book.author?.authorId : (authors.find(a => a.name === book.author)?.authorId || 1);
                          const authorName = typeof book.author === 'object' ? (book.author?.name || 'Author') : String(book.author);
                          const isFollowing = followedAuthorIds.some(id => String(id) === String(authorId));

                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleFollowAuthor(authorId, authorName)}
                                className={cn(
                                  "text-xs px-2.5 py-1 rounded-xl font-bold border transition-all flex items-center gap-1 shadow-2xs",
                                  isFollowing
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                )}
                              >
                                <UserPlus size={12} />
                                <span>{isFollowing ? 'Following' : '+ Follow'}</span>
                              </button>

                              <Link
                                to={`/network?author=${authorId}`}
                                className="btn-ghost text-xs px-2 py-1 text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 shadow-2xs flex items-center gap-1"
                                title="Explore author posts and publications in Scholar Network"
                              >
                                <ExternalLink size={11} />
                                <span className="hidden sm:inline">Network Feed</span>
                              </Link>
                            </>
                          );
                        })()}

                        {isOwner && typeof book.author === 'object' && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditAuthor(book.author)}
                            className="btn-ghost text-xs px-2.5 py-1 text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center gap-1"
                            title="Edit author profile details"
                          >
                            <Edit3 size={11} />
                            <span>Edit Author</span>
                          </button>
                        )}
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
                      Uploaded by {typeof book.uploadedBy === 'object' ? (book.uploadedBy?.username || book.uploadedBy?.name || 'Community') : String(book.uploadedBy)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        {/* Tabbed Navigation Bar */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Document Overview', icon: FileText },
              { id: 'ratings', label: `Ratings & Reviews (${ratings.length})`, icon: Star },
              { id: 'versions', label: `Version History (${versions.length || 1})`, icon: Layers },
              { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})`, icon: Bookmark },
              { id: 'comments', label: `Discussion (${comments.length})`, icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
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

                  <button
                    onClick={handleToggleWishlist}
                    disabled={togglingWishlist}
                    className={cn(
                      'btn-ghost w-full text-xs py-2.5 flex items-center justify-center gap-2 transition-colors',
                      wishlistId ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100' : ''
                    )}
                  >
                    <Heart size={14} className={cn(wishlistId ? 'fill-rose-500 text-rose-500' : '')} />
                    <span>{wishlistId ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  {book.fileUrl && (
                    <a
                      href={book.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (user?.userId && book?.bookId) {
                          recordBookDownload(book.bookId, user.userId).catch(() => {});
                        }
                      }}
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

              {/* Similar Resources Section Powered by TF-IDF & Cosine Similarity */}
              <div className="lg:col-span-3">
                <SimilarResources bookId={book.bookId} currentCategory={book.category} limit={4} />
              </div>
            </div>
          )}

          {/* TAB 2: RATINGS & REVIEWS */}
          {activeTab === 'ratings' && (
            <div className="max-w-3xl space-y-6">
              {/* Summary Stats Banner */}
              <div className="glass-card rounded-2xl p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex flex-col items-center justify-center font-extrabold text-2xl border border-amber-200 shadow-xs">
                    {ratings.length > 0
                      ? (ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / ratings.length).toFixed(1)
                      : '0.0'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Based on {ratings.length} student & scholar review{ratings.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  {userRating ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> You rated this {userRating.rating} / 5
                    </span>
                  ) : (
                    <span className="text-slate-400">Share your evaluation below</span>
                  )}
                </div>
              </div>

              {/* Rating Form */}
              <form onSubmit={handleSubmitRating} className="glass-card rounded-2xl p-6 bg-white space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  {userRating ? 'Update Your Rating & Review' : 'Rate this Resource'}
                </h4>

                {/* Interactive Star Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Score (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStar(star)}
                        className="p-1 text-slate-300 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={cn(
                            star <= selectedStar
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          )}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2 font-mono">{selectedStar} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Review Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={ratingReviewText}
                    onChange={(e) => setRatingReviewText(e.target.value)}
                    placeholder="How clear are the explanations? Is this textbook comprehensive for exam preparation?"
                    className="input-base text-xs resize-none"
                    disabled={ratingLoading}
                  />
                </div>

                {ratingError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} /> {ratingError}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {userRating ? (
                    <button
                      type="button"
                      onClick={handleDeleteRating}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete My Rating
                    </button>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={ratingLoading}
                    className="btn-primary text-xs px-5 py-2"
                  >
                    {ratingLoading ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                  Community Evaluations ({ratings.length})
                </h4>

                {ratings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-slate-100 text-center text-slate-400 text-xs">
                    No ratings submitted yet. Be the first to rate!
                  </div>
                ) : (
                  ratings.map((r, i) => (
                    <div key={r.ratingId || i} className="glass-card rounded-2xl p-4 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {getInitials(r.user?.username || 'User')}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{r.user?.username || 'Scholar'}</span>
                            <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                              {Array.from({ length: Number(r.rating) || 5 }).map((_, j) => (
                                <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.createdAt && (
                          <span className="text-[10px] text-slate-400 font-mono">{formatRelativeDate(r.createdAt)}</span>
                        )}
                      </div>
                      {r.review && (
                        <p className="text-xs text-slate-600 leading-relaxed pl-9">
                          {r.review}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VERSIONS TIMELINE */}
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
                {versions.length > 0 ? (
                  versions.map((v) => (
                    <div key={v.bookId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Version Cover Thumbnail */}
                        <div className="w-11 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm bg-slate-900 relative">
                          <img
                            src={v.coverUrl || DEFAULT_BOOK_COVER}
                            alt={v.title}
                            onError={(e) => {
                              if (e.currentTarget.src !== DEFAULT_BOOK_COVER) {
                                e.currentTarget.src = DEFAULT_BOOK_COVER;
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] border border-indigo-100">
                              v{v.version || 1}.0
                            </span>
                            <p className="text-sm font-bold text-slate-900 truncate">{v.title}</p>
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

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Owner edit specific version cover & details */}
                        {isOwner && (
                          <button
                            onClick={() => handleOpenEditVersionModal(v)}
                            className="btn-ghost text-xs px-2.5 py-1.5 gap-1 text-slate-600 hover:text-indigo-600"
                            title="Edit this version's cover or details"
                          >
                            <Edit3 size={12} /> Edit Edition
                          </button>
                        )}

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
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-400">
                      Version 1.0 is currently the only published edition for this document.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="max-w-3xl space-y-6">
              {/* Add Bookmark Card */}
              <form onSubmit={handleAddBookmark} className="glass-card rounded-2xl p-5 bg-white flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Add Page Bookmark
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={book.pages || 9999}
                    value={newBookmarkPage}
                    onChange={(e) => setNewBookmarkPage(e.target.value)}
                    placeholder="Page Number"
                    className="input-base text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingBookmark}
                  className="btn-primary text-xs px-5 py-2.5 self-end w-full sm:w-auto"
                >
                  <Bookmark size={14} /> Add Bookmark
                </button>
              </form>

              {/* Bookmarks List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                  Saved Bookmarks ({bookmarks.length})
                </h4>

                {bookmarks.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-slate-100 text-center text-slate-400 text-xs">
                    No bookmarks saved for this book yet. Save key pages for quick referencing!
                  </div>
                ) : (
                  bookmarks.map((bm) => {
                    const bmId = bm.bookMarkId || bm.bookmarkId;
                    return (
                      <div
                        key={bmId || Math.random()}
                        className="glass-card rounded-2xl p-4 bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            <Bookmark size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              Page {bm.page || 1}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Saved reference
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/reader/${book.bookId}`}
                            className="btn-accent text-xs px-3 py-1.5 flex items-center gap-1"
                          >
                            <BookOpen size={12} /> Open Reader
                          </Link>
                          <button
                            onClick={() => handleDeleteBookmark(bmId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove Bookmark"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DISCUSSION & COMMENTS */}
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

        {/* ── MODAL 1: EDIT MAIN BOOK DETAILS & COVER (OWNER ONLY) ───────────── */}
        {showEditModal && isOwner && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Resource & Cover</h3>
                  <p className="text-xs text-slate-500">Update metadata and customize document cover image</p>
                </div>
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
                {/* Cover Image Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5 flex items-center justify-between">
                    <span>Cover Image</span>
                    {editCoverUrl && (
                      <button
                        type="button"
                        onClick={() => setEditCoverUrl('')}
                        className="text-[11px] text-rose-600 hover:underline font-normal cursor-pointer"
                      >
                        Reset to Gradient
                      </button>
                    )}
                  </label>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 shadow-sm relative">
                      <img
                        src={editCoverUrl || DEFAULT_BOOK_COVER}
                        alt="Cover preview"
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_BOOK_COVER) {
                            e.currentTarget.src = DEFAULT_BOOK_COVER;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="relative inline-flex items-center gap-1.5 btn-ghost text-xs px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
                        <Upload size={13} />
                        <span>{editCoverUploading ? 'Uploading...' : editCoverUrl ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUploadEditCover(e.target.files[0])}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                        PNG, JPG, WEBP recommended (e.g. 400x520)
                      </p>
                    </div>
                  </div>
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase font-mono">Author</label>
                      <button
                        type="button"
                        onClick={() => setShowCreateAuthorInModal(true)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} /> New Author
                      </button>
                    </div>
                    <select
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      className="input-base text-xs cursor-pointer"
                    >
                      <option value="">Select Author...</option>
                      {authors.map((a) => (
                        <option key={a.authorId} value={a.authorId}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Author Mini Card & Quick Edit */}
                {editAuthor && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {(() => {
                        const sel = authors.find(a => String(a.authorId) === String(editAuthor));
                        return (
                          <>
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              <img
                                src={getAuthorAvatar(sel?.profileUrl)}
                                alt=""
                                onError={(e) => {
                                  if (e.currentTarget.src !== DEFAULT_AUTHOR_AVATAR) {
                                    e.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{sel?.name || 'Selected Author'}</p>
                              <p className="text-[10px] text-slate-400 truncate font-mono">{sel?.bio || 'Author Profile'}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sel = authors.find(a => String(a.authorId) === String(editAuthor));
                        if (sel) handleOpenEditAuthor(sel);
                      }}
                      className="btn-ghost text-xs px-2 py-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 flex items-center gap-1"
                    >
                      <Edit3 size={11} />
                      <span>Edit Author Info</span>
                    </button>
                  </div>
                )}

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
                    disabled={editLoading || editCoverUploading || !editTitle.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: UPLOAD NEW VERSION (OWNER ONLY) ────────────────────────── */}
        {showVersionModal && isOwner && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 my-8">
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

                {/* Optional Custom Cover for this revision */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5 flex items-center justify-between">
                    <span>Revision Cover Image</span>
                    {verCoverUrl && (
                      <button
                        type="button"
                        onClick={() => setVerCoverUrl('')}
                        className="text-[11px] text-slate-500 hover:underline font-normal cursor-pointer"
                      >
                        Use Default Cover
                      </button>
                    )}
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 shadow-sm relative">
                      <img
                        src={verCoverUrl || book.coverUrl || DEFAULT_BOOK_COVER}
                        alt="Cover preview"
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_BOOK_COVER) {
                            e.currentTarget.src = DEFAULT_BOOK_COVER;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="relative inline-flex items-center gap-1.5 btn-ghost text-xs px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
                        <ImageIcon size={13} />
                        <span>{verCoverUploading ? 'Uploading...' : verCoverUrl ? 'Change Custom Cover' : 'Upload Custom Cover'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUploadVersionCover(e.target.files[0])}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        Optional · Defaults to the main document cover
                      </p>
                    </div>
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
                    disabled={verLoading || verFileUploading || verCoverUploading || !verFileUrl}
                    className="btn-accent text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {verLoading ? 'Publishing Revision...' : 'Publish New Version'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 3: EDIT SPECIFIC VERSION COVER & DETAILS (OWNER ONLY) ───── */}
        {editVersionTarget && isOwner && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Version {editVersionTarget.version || 1}.0</h3>
                  <p className="text-xs text-slate-500">Update cover image and details for this specific edition</p>
                </div>
                <button onClick={() => setEditVersionTarget(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              {verEditError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4">
                  {verEditError}
                </div>
              )}

              <form onSubmit={handleEditVersionSubmit} className="space-y-4">
                {/* Cover Image Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5 flex items-center justify-between">
                    <span>Edition Cover Image</span>
                    {verEditCoverUrl && (
                      <button
                        type="button"
                        onClick={() => setVerEditCoverUrl('')}
                        className="text-[11px] text-rose-600 hover:underline font-normal cursor-pointer"
                      >
                        Reset to Gradient
                      </button>
                    )}
                  </label>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 shadow-sm relative">
                      <img
                        src={verEditCoverUrl || DEFAULT_BOOK_COVER}
                        alt="Edition cover"
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_BOOK_COVER) {
                            e.currentTarget.src = DEFAULT_BOOK_COVER;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="relative inline-flex items-center gap-1.5 btn-ghost text-xs px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm">
                        <Upload size={13} />
                        <span>{verEditCoverUploading ? 'Uploading...' : verEditCoverUrl ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleUploadTargetVersionCover(e.target.files[0])}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                        Upload custom art for this edition
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Edition Title</label>
                  <input
                    type="text"
                    value={verEditTitle}
                    onChange={(e) => setVerEditTitle(e.target.value)}
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={verEditDesc}
                    onChange={(e) => setVerEditDesc(e.target.value)}
                    className="input-base text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">Pages</label>
                  <input
                    type="number"
                    min={1}
                    value={verEditPages}
                    onChange={(e) => setVerEditPages(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditVersionTarget(null)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verEditLoading || verEditCoverUploading || !verEditTitle.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {verEditLoading ? 'Saving Edition...' : 'Save Edition Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ── MODAL 4: EDIT AUTHOR DETAILS ───────────────────────────────────── */}
        {showEditAuthorModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Edit Author Profile</h3>
                    <p className="text-xs text-slate-500">Update author's display name, bio, and profile photo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditAuthorModal(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {authorEditError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{authorEditError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAuthor} className="space-y-4">
                {/* Author Avatar Preview & Upload */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 relative shadow-sm">
                    <img
                      src={authorEditProfileUrl || DEFAULT_AUTHOR_AVATAR}
                      alt="Author avatar"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_AUTHOR_AVATAR) {
                          e.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">Profile Photo / Avatar</p>
                    <p className="text-[10px] text-slate-400 mb-1.5 font-mono">Upload custom photo or use default</p>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center gap-1.5 btn-ghost text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs">
                        <Upload size={11} />
                        <span>{authorEditProfileUploading ? 'Uploading...' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleAuthorAvatarUpload(e.target.files[0])}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      {authorEditProfileUrl && (
                        <button
                          type="button"
                          onClick={() => setAuthorEditProfileUrl('')}
                          className="text-[10px] text-slate-500 hover:text-rose-600 font-mono underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={authorEditName}
                    onChange={(e) => setAuthorEditName(e.target.value)}
                    placeholder="e.g. Andrew S. Tanenbaum"
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Bio / Affiliation
                  </label>
                  <input
                    type="text"
                    value={authorEditBio}
                    onChange={(e) => setAuthorEditBio(e.target.value)}
                    placeholder="e.g. Professor of Computer Science"
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Custom Profile URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={authorEditProfileUrl}
                    onChange={(e) => setAuthorEditProfileUrl(e.target.value)}
                    placeholder="https://... or uploaded image"
                    className="input-base text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditAuthorModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={authorEditLoading || authorEditProfileUploading || !authorEditName.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {authorEditLoading ? 'Saving...' : 'Save Author Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 5: QUICK CREATE AUTHOR ────────────────────────────────────── */}
        {showCreateAuthorInModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New Author</h3>
                    <p className="text-xs text-slate-500">Create a new author and assign to this resource</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateAuthorInModal(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleQuickCreateAuthor} className="space-y-4">
                {/* Author Avatar Preview & Upload */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 relative shadow-sm">
                    <img
                      src={quickAuthorProfileUrl || DEFAULT_AUTHOR_AVATAR}
                      alt="Author preview"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_AUTHOR_AVATAR) {
                          e.currentTarget.src = DEFAULT_AUTHOR_AVATAR;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">Author Photo / Avatar</p>
                    <p className="text-[10px] text-slate-400 mb-1.5 font-mono">Optional · Defaults to standard avatar</p>
                    <label className="relative inline-flex items-center gap-1.5 btn-ghost text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs">
                      <Upload size={11} />
                      <span>{quickAuthorProfileUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleQuickAuthorAvatarUpload(e.target.files[0])}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={quickAuthorName}
                    onChange={(e) => setQuickAuthorName(e.target.value)}
                    placeholder="e.g. Andrew S. Tanenbaum"
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Bio / Affiliation
                  </label>
                  <input
                    type="text"
                    value={quickAuthorBio}
                    onChange={(e) => setQuickAuthorBio(e.target.value)}
                    placeholder="e.g. Professor of Computer Science"
                    className="input-base text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateAuthorInModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quickAuthorLoading || quickAuthorProfileUploading || !quickAuthorName.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {quickAuthorLoading ? 'Creating...' : 'Create & Select Author'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
