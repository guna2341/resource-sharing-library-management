import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Sparkles, UserCheck, Flame, Bookmark, ArrowUpRight,
  TrendingUp, Users, BookOpen
} from 'lucide-react';
import { CoverImage } from '../resources/ResourceCard';
import { cn, fileTypeColor, fileTypeLabel } from '../../lib/utils';

export function RecommendationCard({ book, index = 0, compact = false }) {
  if (!book) return null;

  const authorName = typeof book.author === 'object'
    ? (book.author?.name || 'Faculty Author')
    : (book.author || 'Faculty Author');

  // Badge styling based on explainable recommendation signal
  const getSignalBadge = () => {
    switch (book.signalType) {
      case 'NETWORK_FOLLOW':
        return {
          icon: <UserCheck size={11} className="text-indigo-600" />,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
          label: book.recommendationReason || `Followed: ${authorName}`,
        };
      case 'CONTENT_SIMILARITY':
        return {
          icon: <Sparkles size={11} className="text-emerald-600" />,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
          label: book.recommendationReason || 'Content Match',
        };
      case 'USER_PREFERENCE':
      case 'CATEGORY_MATCH':
        return {
          icon: <Bookmark size={11} className="text-sky-600" />,
          color: 'bg-sky-50 text-sky-700 border-sky-200/70',
          label: book.recommendationReason || `Field: ${book.category || 'Focus'}`,
        };
      case 'TRENDING':
        return {
          icon: <Flame size={11} className="text-amber-600" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200/70',
          label: book.recommendationReason || 'Trending in Repository',
        };
      default:
        return {
          icon: <Sparkles size={11} className="text-indigo-600" />,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
          label: book.recommendationReason || 'Recommended for you',
        };
    }
  };

  const badge = getSignalBadge();
  const matchPct = book.matchPercentage || (book.score ? Math.round(book.score * 100) : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col"
    >
      <Link
        to={`/library/${book.bookId}`}
        className="group block h-full select-none"
        aria-label={`View ${book.title}`}
      >
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full bg-white relative border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
          {/* Card Cover Visual */}
          <div className="relative overflow-hidden">
            <CoverImage book={book} size={compact ? 'default' : 'lg'} />

            {/* Match confidence indicator pill on top right */}
            {matchPct && matchPct > 0 && (
              <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 font-mono shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {matchPct}% Match
                </span>
              </div>
            )}

            {/* Quick hover action pill */}
            <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
              <div className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md text-slate-900 shadow-md flex items-center justify-center">
                <ArrowUpRight size={14} strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="p-4 flex flex-col justify-between flex-1 gap-3">
            <div>
              {/* Explainable recommendation reason pill */}
              <div className="mb-2">
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border line-clamp-1 leading-tight', badge.color)}>
                  {badge.icon}
                  <span className="truncate">{badge.label}</span>
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {book.title}
              </h3>

              {/* Category & Tags metadata */}
              {book.category && (
                <p className="text-[11px] font-medium text-slate-400 mt-1 truncate">
                  {book.category} {book.pages ? `· ${book.pages} pages` : ''}
                </p>
              )}
            </div>

            {/* Author & Rating Footer */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[130px] font-medium text-slate-600">
                {authorName}
              </span>

              {book.averageRating > 0 ? (
                <div className="flex items-center gap-1 text-amber-600 font-semibold font-mono text-[11px]">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span>{book.averageRating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-300 font-mono">Academic Text</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function RecommendationCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden bg-white border border-slate-200/80 animate-pulse">
      <div className="aspect-[4/5] bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="pt-2.5 border-t border-slate-100 flex justify-between">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/6" />
        </div>
      </div>
    </div>
  );
}
