import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Plus, Search, BookOpen, Edit3, Trash2, ExternalLink,
  Sparkles, Image as ImageIcon, ArrowRight, BookMarked, AlertCircle,
  GraduationCap, Building, Star, CheckCircle2, X, Upload, UserPlus, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { networkApi } from '../api/network';
import { getAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } from '../api/authors';
import { getBooks } from '../api/books';
import { uploadFile } from '../api/files';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, getInitials, DEFAULT_AUTHOR_AVATAR } from '../lib/utils';

export default function AuthorsPage() {
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
  const [followedAuthorIds, setFollowedAuthorIds] = useState(networkApi.getFollowedAuthorIds());

  function handleToggleFollow(authorId, name) {
    networkApi.toggleFollow(authorId, name);
    setFollowedAuthorIds(networkApi.getFollowedAuthorIds());
  }

  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alphabetFilter, setAlphabetFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Author Detail Drawer
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileUrl, setEditProfileUrl] = useState('');
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([
      getAuthors().catch(() => ({ success: false, data: [] })),
      getBooks().catch(() => ({ success: false, data: [] })),
    ])
      .then(([authRes, booksRes]) => {
        if (authRes.success) setAuthors(authRes.data || []);
        if (booksRes.success) setBooks(booksRes.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load authors.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const getAuthorBooks = (authorId) => {
    return books.filter((b) => b.author?.authorId === authorId || b.author === authorId);
  };

  async function handleUploadAvatar(file, isEdit = false) {
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadFile(file);
      if (res.success && res.data) {
        if (isEdit) setEditProfileUrl(res.data);
        else setProfileUrl(res.data);
      }
    } catch {}
    finally {
      setUploadingImage(false);
    }
  }

  async function handleCreateAuthor(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        profileUrl: profileUrl || DEFAULT_AUTHOR_AVATAR,
      };
      const res = await createAuthor(payload);
      if (res.success) {
        setShowCreateModal(false);
        setName('');
        setBio('');
        setProfileUrl('');
        loadData();
      } else {
        setCreateError(res.message || 'Failed to create author');
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create author');
    } finally {
      setCreating(false);
    }
  }

  async function handleEditAuthor(e) {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    setEditing(true);
    setEditError('');
    try {
      const payload = {
        name: editName.trim(),
        bio: editBio.trim(),
        profileUrl: editProfileUrl || editTarget.profileUrl || DEFAULT_AUTHOR_AVATAR,
      };
      const res = await updateAuthor(editTarget.authorId, payload);
      if (res.success) {
        setShowEditModal(false);
        setEditTarget(null);
        loadData();
      } else {
        setEditError(res.message || 'Failed to update author');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update author');
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteAuthor(authorId) {
    if (!confirm('Are you sure you want to remove this faculty author?')) return;
    try {
      await deleteAuthor(authorId);
      loadData();
      if (selectedAuthor?.authorId === authorId) setSelectedAuthor(null);
    } catch {}
  }

  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const filteredAuthors = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (authors || []).filter((a) => {
      if (!a) return false;
      const matchesSearch =
        !q ||
        (a.name || '').toLowerCase().includes(q) ||
        (a.bio || '').toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (alphabetFilter !== 'ALL') {
        return (a.name || '').toUpperCase().startsWith(alphabetFilter);
      }

      return true;
    });
  }, [authors, searchQuery, alphabetFilter]);

  return (
    <AppLayout breadcrumb="Faculty & Authors">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-indigo">Academic Directory</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Institutional Faculty</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <GraduationCap className="text-indigo-600" size={28} />
              Faculty & Author Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore profiles of university researchers, professors, and peer scholars who contribute to the library.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20"
          >
            <Plus size={15} /> Register Author
          </button>
        </div>

        {/* Search & Alphabet Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search faculty by name, department, or research topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 py-2 text-xs rounded-xl"
            />
          </div>

          {/* Alphabet Index */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-slate-100 rounded-xl text-[11px] font-mono font-bold">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setAlphabetFilter(letter)}
                className={cn(
                  'px-2 py-0.5 rounded-lg transition-all',
                  alphabetFilter === letter
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="enterprise-card p-6 bg-white animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 mx-auto" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : filteredAuthors.length === 0 ? (
          <div className="enterprise-card p-12 text-center bg-white max-w-md mx-auto my-12">
            <GraduationCap size={32} className="text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No faculty members found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">No authors matched your search or alphabetical filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setAlphabetFilter('ALL'); }}
              className="btn-ghost text-xs px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuthors.map((author) => {
              const authorBooks = getAuthorBooks(author.authorId);
              return (
                <div
                  key={author.authorId}
                  className="enterprise-card p-6 bg-white flex flex-col justify-between group hover:border-indigo-300 transition-all space-y-4"
                >
                  <div>
                    {/* Header: Photo & Quick Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <Link
                        to={`/authors/${author.authorId}`}
                        className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs flex-shrink-0 block group-hover:border-indigo-400 transition-colors"
                        title={`View ${author.name}'s profile and published works`}
                      >
                        <img
                          src={author.profileUrl || DEFAULT_AUTHOR_AVATAR}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </Link>

                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditTarget(author);
                              setEditName(author.name || '');
                              setEditBio(author.bio || '');
                              setEditProfileUrl(author.profileUrl || '');
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            title="Edit author"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteAuthor(author.authorId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete author"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/authors/${author.authorId}`}
                      className="block group/link"
                    >
                      <h3 className="text-base font-bold text-slate-900 group-hover/link:text-indigo-600 transition-colors">
                        {author.name}
                      </h3>
                      <p className="text-[11px] font-mono text-indigo-600 font-semibold mt-0.5">
                        {author.department || 'Faculty Researcher'}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {author.bio || 'Author contributing to academic library collections.'}
                      </p>
                    </Link>
                  </div>

                  {/* Footer Metrics & Dossier CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="badge-enterprise badge-slate text-[10px]">
                      <BookOpen size={11} /> {authorBooks.length} Works
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleFollow(author.authorId, author.name)}
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer',
                          followedAuthorIds.some((id) => String(id) === String(author.authorId))
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                        )}
                      >
                        {followedAuthorIds.some((id) => String(id) === String(author.authorId)) ? (
                          <>
                            <UserCheck size={11} /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus size={11} /> Follow
                          </>
                        )}
                      </button>
                      <Link
                        to={`/authors/${author.authorId}`}
                        className="btn-accent text-xs px-2.5 py-1 shadow-xs flex items-center gap-1"
                        title="View profile and published works"
                      >
                        <span>Works</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Author Dossier Modal */}
      <AnimatePresence>
        {selectedAuthor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAuthor(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 z-10 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex-shrink-0">
                    <img
                      src={selectedAuthor.profileUrl || DEFAULT_AUTHOR_AVATAR}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-enterprise badge-indigo">Faculty Member</span>
                      <button
                        onClick={() => handleToggleFollow(selectedAuthor.authorId, selectedAuthor.name)}
                        className={cn(
                          "text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all inline-flex items-center gap-1",
                          followedAuthorIds.includes(Number(selectedAuthor.authorId)) || followedAuthorIds.includes(String(selectedAuthor.authorId))
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                        )}
                      >
                        {followedAuthorIds.includes(Number(selectedAuthor.authorId)) || followedAuthorIds.includes(String(selectedAuthor.authorId)) ? (
                          <>✓ Following</>
                        ) : (
                          <>+ Follow</>
                        )}
                      </button>
                      <Link
                        to={`/network?author=${selectedAuthor.authorId}`}
                        onClick={() => setSelectedAuthor(null)}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all inline-flex items-center gap-1"
                      >
                        <Globe size={11} /> Feed
                      </Link>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">{selectedAuthor.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {selectedAuthor.department || 'Academic Contributor'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAuthor(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 font-mono uppercase text-[10px] mb-1">Faculty Biography</p>
                {selectedAuthor.bio || 'No biography recorded.'}
              </div>

              {/* Published Works list */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider mb-3">
                  Published Manuscripts ({getAuthorBooks(selectedAuthor.authorId).length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getAuthorBooks(selectedAuthor.authorId).length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No documents linked to this author yet.</p>
                  ) : (
                    getAuthorBooks(selectedAuthor.authorId).map((book) => (
                      <div
                        key={book.bookId}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-bold text-slate-900 truncate">{book.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {book.fileType} · {book.pages} pages · {book.category || 'General'}
                          </p>
                        </div>
                        <Link
                          to={`/library/${book.bookId}`}
                          onClick={() => setSelectedAuthor(null)}
                          className="btn-accent text-xs px-3 py-1 flex-shrink-0"
                        >
                          View <ArrowRight size={12} />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Author Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">Register Faculty Author</h3>
              <p className="text-xs text-slate-500 mb-4">Add a new verified professor or scholar to the academic registry.</p>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> {createError}
                </div>
              )}

              <form onSubmit={handleCreateAuthor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Author Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Leslie Lamport"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Academic Biography & Focus
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Department, research interests, and authored monographs..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-base text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {creating ? 'Registering...' : 'Register Faculty'}
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
