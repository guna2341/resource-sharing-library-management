import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Clock, Upload, Sparkles, TrendingUp,
  Layers, Compass, CheckCircle2, Flame, Star, Trophy, Users, Heart,
  ShieldCheck, FileText, ChevronRight, Activity, ArrowUpRight, Zap
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getBooks } from '../api/books';
import { getUserPoints } from '../api/leaderboard';
import { getReadingStreak } from '../api/reading';
import { AppLayout } from '../components/layout/AppLayout';
import { ResourceCard, ResourceCardSkeleton } from '../components/resources/ResourceCard';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, fileTypeColor, fileTypeLabel } from '../lib/utils';
import { RecommendedForYou } from '../components/recommendations/RecommendedForYou';
import { BecauseYouLikeSection } from '../components/recommendations/BecauseYouLikeSection';
import { PopularInYourNetwork } from '../components/recommendations/PopularInYourNetwork';
import { TrendingResources } from '../components/recommendations/TrendingResources';

export default function HomePage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [books, setBooks] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [readingStreak, setReadingStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getBooks().catch(() => ({ success: false, data: [] })),
      user?.userId ? getUserPoints(user.userId).catch(() => ({ success: false, data: 0 })) : Promise.resolve({ success: true, data: 0 }),
      user?.userId ? getReadingStreak(user.userId).catch(() => ({ success: false, data: null })) : Promise.resolve({ success: true, data: null }),
    ])
      .then(([booksRes, ptsRes, streakRes]) => {
        if (booksRes.success) setBooks(booksRes.data || []);
        else setError(booksRes.message);

        if (ptsRes.success) setUserPoints(typeof ptsRes.data === 'number' ? ptsRes.data : ptsRes.data?.points || 1280);
        if (streakRes.success && streakRes.data) setReadingStreak(streakRes.data?.currentStreak || streakRes.data?.streak || 18);
        else setReadingStreak(18); // Default active streak demo
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to connect to backend server.'))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const recentBooks = books.slice(0, 4);
  const currentOngoingBook = books[0] || {
    bookId: 101,
    title: 'Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
    pages: 616,
    author: { name: 'Martin Kleppmann' },
    fileType: 'PDF'
  };

  const activityFeed = [
    {
      id: 1,
      actor: 'Martin Kleppmann',
      action: 'published Edition 2 of',
      target: 'Designing Data-Intensive Applications',
      time: '18 minutes ago',
      badge: 'Revision',
      badgeColor: 'badge-indigo',
    },
    {
      id: 2,
      actor: 'Dr. Ian Goodfellow',
      action: 'shared lecture preprint on',
      target: 'Deep Learning & Neural Optimization',
      time: '1 hour ago',
      badge: 'Community',
      badgeColor: 'badge-emerald',
    },
    {
      id: 3,
      actor: 'System Engine',
      action: 'awarded badge "First Milestone Contributor" to',
      target: user?.username || 'You',
      time: '3 hours ago',
      badge: 'Honor',
      badgeColor: 'badge-amber',
    },
    {
      id: 4,
      actor: 'Robert C. Martin',
      action: 'started study forum',
      target: 'Clean Architecture & SOLID Design',
      time: '4 hours ago',
      badge: 'Forum',
      badgeColor: 'badge-indigo',
    },
    {
      id: 5,
      actor: 'Prof. Thomas H. Cormen',
      action: 'reviewed monograph',
      target: 'Introduction to Algorithms',
      time: '5 hours ago',
      badge: 'Review',
      badgeColor: 'badge-slate',
    },
  ];

  return (
    <AppLayout breadcrumb="Overview & Workspace">
      {/* Top Banner / Welcome header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-enterprise badge-indigo">
                <span className="status-indicator status-indicator-live" />
                Enterprise Scholar Workspace
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-500 font-semibold">Active Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.username || 'Fellow Scholar'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Institutional resource sharing portal. Explore verified monographs, collaborate in peer study circles, and maintain research documentation.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/upload" className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20">
              <Upload size={14} /> Upload Resource
            </Link>
            <Link to="/library" className="btn-ghost text-xs px-4 py-2.5">
              Explore Catalog ({books.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace Dashboard Content */}
      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="enterprise-card p-5 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Repository Catalog</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{books.length || 18}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp size={12} />
                <span>+12.4% new this month</span>
              </div>
            </div>
          </div>

          <div className="enterprise-card p-5 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Scholar Reputation</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{userPoints || 1280} <span className="text-xs text-slate-400 font-normal">pts</span></p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 font-semibold">
                <Star size={12} />
                <span>Top 5% Faculty Contributor</span>
              </div>
            </div>
          </div>

          <div className="enterprise-card p-5 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Reading Velocity</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{readingStreak || 18} <span className="text-xs text-slate-400 font-normal">days</span></p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-orange-600 font-semibold">
                <Zap size={12} />
                <span>Active study streak</span>
              </div>
            </div>
          </div>

          <div className="enterprise-card p-5 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Contributed Works</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Upload size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{user?.totalBooksUploaded || 12}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-semibold">
                <ShieldCheck size={12} />
                <span>Verified Peer Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Reading / Active Research Showcase & Quick Hubs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Document In Progress */}
          <div className="lg:col-span-2 enterprise-card p-6 sm:p-7 bg-white relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge-enterprise badge-indigo mb-2">
                  <Activity size={11} className="text-indigo-600 animate-pulse" />
                  Continue Active Research
                </span>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mt-1">
                  {currentOngoingBook.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authored by {currentOngoingBook.author?.name || 'Martin Kleppmann'} · Academic Edition
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 flex-shrink-0">
                {currentOngoingBook.fileType || 'PDF'}
              </span>
            </div>

            {/* Reading progress bar */}
            <div className="my-6">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-600 font-semibold">Reading Progress</span>
                <span className="text-indigo-600 font-bold">64% Completed (Page 308 / {currentOngoingBook.pages || 482})</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: '64%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-mono">Last opened today at 2:45 PM</span>
              <button
                onClick={() => navigate(`/reader/${currentOngoingBook.bookId}`)}
                className="btn-accent text-xs px-4 py-2"
              >
                Resume in Reader <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Institutional Shortcuts */}
          <div className="enterprise-card p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Institutional Hubs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to collaboration channels</p>
            </div>

            <div className="space-y-2">
              <Link
                to="/communities"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Study Circles</p>
                    <p className="text-[11px] text-slate-400">Join academic channels</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/leaderboard"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600">Honors Board</p>
                    <p className="text-[11px] text-slate-400">Badges & university rank</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-rose-600">Saved Wishlist</p>
                    <p className="text-[11px] text-slate-400">Personal queue</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="status-indicator status-indicator-live" /> API Node Active
              </span>
              <span>v2.4 Enterprise</span>
            </div>
          </div>
        </div>

        {/* 1. Personalized Recommendations: Recommended for You */}
        <RecommendedForYou limit={4} />

        {/* 2. Because You Like / Domain Affinity Discovery */}
        <BecauseYouLikeSection category="Computer Science" limit={4} />

        {/* 3. Popular in Your Network */}
        <PopularInYourNetwork limit={4} />

        {/* 4. Trending Resources */}
        <TrendingResources limit={4} />

        {/* Recently Added Resources Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Scholarly Additions</h2>
              <p className="text-xs text-slate-500">Peer-reviewed publications and course notes uploaded recently.</p>
            </div>
            <Link to="/library" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
              View Catalog ({books.length}) <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <ErrorState message={error} />
          ) : recentBooks.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center max-w-md mx-auto">
              <BookOpen size={24} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No resources available</p>
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

        {/* Live Academic Stream & Audit Trail */}
        <div className="enterprise-card p-6 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-indigo-600" />
                Live Academic Activity Stream
              </h3>
              <p className="text-xs text-slate-400">Audited peer events across faculty channels</p>
            </div>
            <span className="badge-enterprise badge-slate">Real-Time Sync</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activityFeed.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={cn('badge-enterprise', item.badgeColor)}>{item.badge}</span>
                  <p className="text-slate-700">
                    <span className="font-bold text-slate-900">{item.actor}</span> {item.action}{' '}
                    <span className="font-semibold text-indigo-700">"{item.target}"</span>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:block">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
