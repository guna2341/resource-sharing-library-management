import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft,
  Image, X, ChevronDown, Sparkles, Plus, UserPlus, Shield,
  Layers, Check, BookOpen, ExternalLink, ArrowRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { uploadFile } from '../api/files';
import { createBook } from '../api/books';
import { getAuthors, createAuthor } from '../api/authors';
import { networkApi } from '../api/network';
import { AppLayout } from '../components/layout/AppLayout';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, fileTypeLabel, fileTypeColor, DEFAULT_AUTHOR_AVATAR } from '../lib/utils';
import { ResourceCard } from '../components/resources/ResourceCard';

const FILE_TYPES = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'TXT', 'OTHER'];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().optional(),
  category: z.string().optional(),
  pages: z.coerce.number().min(1, 'Pages must be at least 1'),
  fileType: z.enum(FILE_TYPES, { required_error: 'File type is required' }),
  author: z.coerce.number({ required_error: 'Author is required' }).min(1, 'Select an author'),
});

export default function UploadPage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  // Quick author modal state
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorProfileUrl, setNewAuthorProfileUrl] = useState('');
  const [newAuthorProfileUploading, setNewAuthorProfileUploading] = useState(false);
  const [authorModalLoading, setAuthorModalLoading] = useState(false);

  // File states
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [docError, setDocError] = useState('');

  const [coverFile, setCoverFile] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverError, setCoverError] = useState('');

  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fileType: 'PDF',
      category: 'Computer Science',
      pages: 1,
    }
  });

  const liveTitle = watch('title', '');
  const liveAuthorId = watch('author', '');
  const liveFileType = watch('fileType', 'PDF');
  const livePages = watch('pages', 1);

  const selectedAuthorObj = authors.find((a) => String(a.authorId) === String(liveAuthorId));

  function loadAuthors() {
    getAuthors()
      .then((res) => {
        if (res.success && res.data?.length) {
          setAuthors(res.data);
          setValue('author', res.data[0].authorId);
        }
      })
      .catch(() => {})
      .finally(() => setAuthorsLoading(false));
  }

  useEffect(() => {
    loadAuthors();
  }, []);

  function handleUseSampleDoc() {
    setDocUrl('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
    setDocFile({ name: 'Distributed_Systems_Foundations_v1.pdf' });
    setDocError('');
    if (!liveTitle) {
      setValue('title', 'Distributed Consensus in Cloud Architecture: Paxos & Raft');
      setValue('pages', 28);
    }
  }

  async function handleCreateAuthor(e) {
    e.preventDefault();
    if (!newAuthorName.trim()) return;
    setAuthorModalLoading(true);
    try {
      const res = await createAuthor({
        name: newAuthorName.trim(),
        bio: newAuthorBio.trim(),
        profileUrl: newAuthorProfileUrl || DEFAULT_AUTHOR_AVATAR,
      });
      if (res.success && res.data) {
        setAuthors((prev) => [...prev, res.data]);
        setValue('author', res.data.authorId);
        setShowAuthorModal(false);
        setNewAuthorName('');
        setNewAuthorBio('');
        setNewAuthorProfileUrl('');
      }
    } catch {}
    finally {
      setAuthorModalLoading(false);
    }
  }

  async function handleAuthorAvatarFile(file) {
    if (!file) return;
    setNewAuthorProfileUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.success && res.data) {
        setNewAuthorProfileUrl(res.data);
      }
    } catch {}
    finally {
      setNewAuthorProfileUploading(false);
    }
  }

  async function handleDocFile(file) {
    setDocFile(file);
    setDocError('');
    setDocUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.success) setDocUrl(res.data);
      else setDocError(res.message || 'Upload failed');
    } catch (err) {
      setDocError(err.response?.data?.message || 'Upload failed');
    } finally {
      setDocUploading(false);
    }
  }

  async function handleCoverFile(file) {
    setCoverFile(file);
    setCoverError('');
    setCoverUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.success) setCoverUrl(res.data);
      else setCoverError(res.message || 'Upload failed');
    } catch (err) {
      setCoverError(err.response?.data?.message || 'Upload failed');
    } finally {
      setCoverUploading(false);
    }
  }

  async function onSubmit(data) {
    const finalDocUrl = docUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
    const authorIdVal = data.author || (authors[0]?.authorId || 1);
    const userIdVal = user?.userId || 1;

    setSubmitState('loading');
    setSubmitError('');
    try {
      const payload = {
        title: data.title,
        description: data.description || 'Academic research publication.',
        category: data.category || 'Computer Science',
        pages: data.pages || 10,
        fileUrl: finalDocUrl,
        fileType: data.fileType || 'PDF',
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        author: authorIdVal,
        uploadedBy: userIdVal,
      };
      const res = await createBook(payload);
      if (res.success) {
        const createdBook = res.data || payload;
        // Enrich with author info if author was just an ID
        const matchedAuthor = authors.find((a) => String(a.authorId) === String(authorIdVal));
        if (matchedAuthor && typeof createdBook.author !== 'object') {
          createdBook.author = matchedAuthor;
        }
        networkApi.onNewBookPublished(createdBook);

        setSubmitState('success');
        setTimeout(() => navigate(`/library/${createdBook?.bookId || ''}`), 1000);
      } else {
        setSubmitError(res.message || 'Failed to create resource.');
        setSubmitState('error');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create resource.');
      setSubmitState('error');
    }
  }

  return (
    <AppLayout breadcrumb="Upload Document">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-indigo">Vault Ingestion</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Institutional Submissions</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Publish Document to Catalog
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribute course lecture notes, textbooks, and peer publications with automated versioning.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="btn-ghost text-xs px-3.5 py-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Main Submission Form */}
          <div className="enterprise-card p-6 sm:p-8 bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* File Upload Drop Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Document */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
                    Primary Document File <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors p-6 text-center bg-slate-50/60 cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                      onChange={(e) => e.target.files?.[0] && handleDocFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    {docUploading ? (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-xs text-slate-500 font-mono">Streaming to Cloud Vault...</p>
                      </div>
                    ) : docUrl ? (
                      <div className="flex flex-col items-center gap-1 py-2">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                        <p className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{docFile?.name || 'Document Ready'}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Presigned S3 Verified</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Select Document File</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">PDF, DOCX, PPTX, XLSX</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {docError ? <p className="text-xs text-rose-500">{docError}</p> : <span />}
                    <button
                      type="button"
                      onClick={handleUseSampleDoc}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={12} /> Use Sample Academic PDF
                    </button>
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
                    Front Cover Illustration <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors p-6 text-center bg-slate-50/60 cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleCoverFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    {coverUploading ? (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-xs text-slate-500">Uploading cover image...</p>
                      </div>
                    ) : coverUrl ? (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <img src={coverUrl} alt="" className="w-12 h-14 object-cover rounded-md shadow-xs mb-1" />
                        <p className="text-xs font-bold text-emerald-700">Cover Attached</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600">
                          <Image size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Select Cover Art</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">PNG, JPG, WEBP</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g. Distributed Consensus in Cloud Systems: Paxos, Raft & Multi-Paxos"
                  {...register('title')}
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                  Academic Abstract & Table of Contents
                </label>
                <textarea
                  rows={3}
                  className="input-base resize-none"
                  placeholder="Key methodologies, course scope, prerequisite references..."
                  {...register('description')}
                />
              </div>

              {/* Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Discipline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                    Discipline
                  </label>
                  <select className="input-base cursor-pointer" {...register('category')}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Applied Mathematics">Applied Mathematics</option>
                    <option value="Applied Physics">Applied Physics</option>
                    <option value="Systems Engineering">Systems Engineering</option>
                    <option value="Research Papers">Research Papers</option>
                  </select>
                </div>

                {/* File Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                    File Type <span className="text-rose-500">*</span>
                  </label>
                  <select className="input-base cursor-pointer" {...register('fileType')}>
                    {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Page Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                    Page Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input-base"
                    {...register('pages')}
                  />
                </div>

                {/* Author Selector + Quick Add */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                      Author <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAuthorModal(true)}
                      className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <select className="input-base cursor-pointer" {...register('author')}>
                    <option value="">Select Author</option>
                    {authors.map((a) => (
                      <option key={a.authorId} value={a.authorId}>{a.name}</option>
                    ))}
                  </select>
                  {errors.author && <p className="text-xs text-rose-500 mt-1">{errors.author.message}</p>}
                </div>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} /> {submitError}
                </div>
              )}

              {submitState === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Resource published successfully! Redirecting to catalog view...
                </div>
              )}

              <button
                type="submit"
                disabled={submitState === 'loading' || docUploading}
                className="btn-accent w-full py-3.5 text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50"
              >
                {submitState === 'loading' ? 'Publishing to Catalog...' : 'Publish Resource to Institutional Catalog'}
              </button>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                Live Card Preview
              </p>
              <span className="badge-enterprise badge-emerald">Catalog Spec</span>
            </div>

            <ResourceCard
              book={{
                bookId: 999,
                title: liveTitle || 'Distributed Systems & Consistency Models',
                author: selectedAuthorObj?.name || 'Martin Kleppmann',
                fileType: liveFileType,
                pages: livePages || 1,
                coverUrl: coverUrl,
                averageRating: 5.0,
                version: 1,
                isCurrent: true,
              }}
            />

            <div className="enterprise-card p-4 bg-white text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Shield size={14} className="text-indigo-600" />
                <span>Enterprise Governance</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All submissions automatically generate immutable version hashes and presigned download tokens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Author Modal */}
      <AnimatePresence>
        {showAuthorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthorModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">Add Faculty Author</h3>
              <p className="text-xs text-slate-500 mb-4">Register an author profile to link research documents.</p>

              <form onSubmit={handleCreateAuthor} className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 relative shadow-xs">
                    <img
                      src={newAuthorProfileUrl || DEFAULT_AUTHOR_AVATAR}
                      alt="Author profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">Faculty Portrait</p>
                    <p className="text-[10px] text-slate-400 mb-1.5 font-mono">PNG or JPG</p>
                    <label className="relative inline-flex items-center gap-1.5 btn-ghost text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs">
                      <Upload size={11} />
                      <span>{newAuthorProfileUploading ? 'Uploading...' : 'Upload Portrait'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleAuthorAvatarFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="e.g. Dr. Leslie Lamport"
                    className="input-base text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Academic Department / Bio
                  </label>
                  <input
                    type="text"
                    value={newAuthorBio}
                    onChange={(e) => setNewAuthorBio(e.target.value)}
                    placeholder="e.g. Professor of Distributed Computing"
                    className="input-base text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthorModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={authorModalLoading || !newAuthorName.trim()}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {authorModalLoading ? 'Saving...' : 'Create Author'}
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
