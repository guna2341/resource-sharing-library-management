import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft,
  Image, X, ChevronDown, Sparkles, Plus, UserPlus
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { uploadFile } from '../api/files';
import { createBook } from '../api/books';
import { getAuthors, createAuthor } from '../api/authors';
import { AppSidebar } from '../components/layout/AppSidebar';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, fileTypeLabel, fileTypeColor, coverGradient } from '../lib/utils';
import { ResourceCard } from '../components/resources/ResourceCard';

const FILE_TYPES = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'TXT', 'OTHER'];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
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
      .then((res) => { if (res.success) setAuthors(res.data || []); })
      .catch(() => {})
      .finally(() => setAuthorsLoading(false));
  }

  useEffect(() => {
    loadAuthors();
  }, []);

  async function handleCreateAuthor(e) {
    e.preventDefault();
    if (!newAuthorName.trim()) return;
    setAuthorModalLoading(true);
    try {
      const res = await createAuthor({ name: newAuthorName.trim(), bio: newAuthorBio.trim() });
      if (res.success && res.data) {
        setAuthors((prev) => [...prev, res.data]);
        setValue('author', res.data.authorId);
        setShowAuthorModal(false);
        setNewAuthorName('');
        setNewAuthorBio('');
      }
    } catch {}
    finally {
      setAuthorModalLoading(false);
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
    if (!docUrl) {
      setDocError('Please upload a document file first.');
      return;
    }
    if (!user?.userId) {
      setSubmitError('You must be signed in to upload.');
      return;
    }
    setSubmitState('loading');
    setSubmitError('');
    try {
      const payload = {
        title: data.title,
        description: data.description || '',
        pages: data.pages,
        fileUrl: docUrl,
        fileType: data.fileType,
        coverUrl: coverUrl || '',
        author: data.author,
        uploadedBy: user.userId,
      };
      const res = await createBook(payload);
      if (res.success) {
        setSubmitState('success');
        setTimeout(() => navigate(`/library/${res.data?.bookId || ''}`), 1200);
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
    <div className="flex min-h-screen bg-[#FAF9F6]">
      <div className="hidden lg:block"><AppSidebar /></div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="bg-white border-b border-slate-200/80 px-6 py-5 sticky top-0 z-20 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="text-lg font-bold text-slate-900">Upload New Resource</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Form Column */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {/* File Upload Drop Zones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Document */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
                      Document File <span className="text-rose-500">*</span>
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
                          <p className="text-xs text-slate-500">Uploading to Supabase S3...</p>
                        </div>
                      ) : docUrl ? (
                        <div className="flex flex-col items-center gap-1 py-2">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          <p className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{docFile?.name || 'Uploaded'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">S3 Stored</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600">
                            <Upload size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Select Document</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">PDF, DOCX, PPTX, XLSX</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {docError && <p className="text-xs text-rose-500 mt-1.5">{docError}</p>}
                  </div>

                  {/* Cover */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
                      Cover Image <span className="text-slate-400 lowercase font-normal">(optional)</span>
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
                          <img src={coverUrl} alt="" className="w-12 h-14 object-cover rounded-md shadow-sm mb-1" />
                          <p className="text-xs font-bold text-emerald-700">Cover Attached</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600">
                            <Image size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Select Image</p>
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
                    Resource Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. Operating Systems: Three Easy Pieces"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                    Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    className="input-base resize-none"
                    placeholder="Key concepts, chapter breakdown, or topic summary..."
                    {...register('description')}
                  />
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      Pages <span className="text-rose-500">*</span>
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
                      <option value="">Select an Author</option>
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

                <button
                  type="submit"
                  disabled={submitState === 'loading' || docUploading}
                  className="btn-accent w-full py-3 text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50"
                >
                  {submitState === 'loading' ? 'Creating Resource...' : 'Publish to Library'}
                </button>
              </form>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                Live Card Preview
              </p>
              <ResourceCard
                book={{
                  bookId: 999,
                  title: liveTitle || 'Untitled Resource Document',
                  author: selectedAuthorObj?.name || 'Author Name',
                  fileType: liveFileType,
                  pages: livePages || 1,
                  coverUrl: coverUrl,
                  averageRating: 0,
                  version: 1,
                  isCurrent: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Create Author Modal */}
        {showAuthorModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Add Author</h3>
              <p className="text-xs text-slate-500 mb-4">Create a new verified author profile in the backend.</p>

              <form onSubmit={handleCreateAuthor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
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
                    value={newAuthorBio}
                    onChange={(e) => setNewAuthorBio(e.target.value)}
                    placeholder="e.g. Professor of Computer Science"
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
