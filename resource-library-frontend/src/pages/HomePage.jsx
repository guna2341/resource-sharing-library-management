import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Clock, Upload, Sparkles, TrendingUp,
  Layers, Compass, CheckCircle2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getBooks } from '../api/books';
import { AppSidebar } from '../components/layout/AppSidebar';
import { ResourceCard, ResourceCardSkeleton } from '../components/resources/ResourceCard';
import { EmptyState, ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn } from '../lib/utils';

export default function HomePage() {
  const user = useSelector(selectCurrentUser);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBooks()
      .then((res) => {
        if (res.success) setBooks(res.data || []);
        else setError(res.message);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to connect to backend server.'))
      .finally(() => setLoading(false));
  }, []);

  const recentBooks = books.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                  Academic Portal
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-mono text-slate-400">Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.username || 'Member'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Here is what’s new in your library collection today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/upload" className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20">
                <Upload size={14} /> Upload Document
              </Link>
              <Link to="/library" className="btn-ghost text-xs px-4 py-2.5">
                Browse All ({books.length})
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-10">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Total Catalog</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{books.length} Books</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Uploaded by You</span>
                <p className="text-2xl font-extrabold text-indigo-600 mt-1">{user?.totalBooksUploaded ?? 0}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Upload size={20} />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 bg-white border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Storage Status</span>
                <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 size={16} /> Supabase S3 Live
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
          </div>

          {/* Recently Added Section */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recently Added Resources</h2>
                <p className="text-xs text-slate-500">Latest publications and course notes uploaded by peers.</p>
              </div>
              <Link to="/library" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                View Catalog <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <ErrorState message={error} />
            ) : recentBooks.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white border border-dashed border-slate-300 text-center max-w-md mx-auto">
                <BookOpen size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No resources yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Be the first to upload lecture notes or a textbook.</p>
                <Link to="/upload" className="btn-accent text-xs px-4 py-2">
                  Upload Resource
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {recentBooks.map((book, i) => <ResourceCard key={book.bookId} book={book} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
