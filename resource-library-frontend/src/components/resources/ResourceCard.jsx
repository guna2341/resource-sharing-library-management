import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, FileText, ArrowUpRight, BookOpen, Layers, User } from 'lucide-react';
import { cn, fileTypeLabel, fileTypeColor, coverGradient, getInitials } from '../../lib/utils';

export function CoverImage({ book, size = 'default' }) {
  const aspectClass = size === 'lg' ? 'aspect-[4/5]' : 'aspect-[3/4]';

  if (book.coverUrl) {
    return (
      <div className={cn('relative w-full overflow-hidden bg-slate-900', aspectClass)}>
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
      </div>
    );
  }

  return (
    <div className={cn('relative w-full flex flex-col justify-between p-4 overflow-hidden select-none', coverGradient(book.bookId), aspectClass)}>
      {/* Subtle cover texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
      
      {/* Top pill */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider font-mono">
          {fileTypeLabel(book.fileType)}
        </span>
        {book.version && book.version > 1 && (
          <span className="px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-md text-[9px] font-semibold text-white/90">
            v{book.version}
          </span>
        )}
      </div>

      {/* Center title presentation */}
      <div className="relative z-10 my-auto py-2">
        <h4 className="text-white font-serif text-sm sm:text-base font-semibold leading-tight line-clamp-3 text-shadow-sm">
          {book.title}
        </h4>
        {book.author && (
          <p className="text-white/70 text-xs mt-1.5 font-medium line-clamp-1">
            {book.author}
          </p>
        )}
      </div>

      {/* Bottom decorative bar */}
      <div className="relative z-10 flex items-center justify-between text-white/60 text-[10px] pt-2 border-t border-white/10 font-mono">
        <span>{book.pages ? `${book.pages} PAGES` : 'DOCUMENT'}</span>
        <BookOpen size={13} className="text-white/70" />
      </div>
    </div>
  );
}

export function ResourceCard({ book, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/library/${book.bookId}`}
        className="group block h-full select-none"
        aria-label={`View ${book.title}`}
      >
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full bg-white relative">
          {/* Card Cover Visual */}
          <div className="relative overflow-hidden">
            <CoverImage book={book} />

            {/* Quick hover action pill */}
            <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
              <div className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 shadow-md flex items-center justify-center">
                <ArrowUpRight size={14} strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="p-4 flex flex-col justify-between flex-1 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide font-mono', fileTypeColor(book.fileType))}>
                  {fileTypeLabel(book.fileType)}
                </span>
                {book.pages && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {book.pages}p
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {book.title}
              </h3>
            </div>

            {/* Author & Rating Footer */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[130px] font-medium text-slate-600">
                {book.author || 'Anonymous'}
              </span>

              {book.averageRating > 0 ? (
                <div className="flex items-center gap-1 text-amber-600 font-semibold font-mono text-[11px]">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span>{book.averageRating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-300 font-mono">Free Access</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse bg-white">
      <div className="aspect-[3/4] bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-slate-100 rounded" />
          <div className="h-4 w-8 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-full bg-slate-100 rounded" />
        <div className="h-4 w-2/3 bg-slate-100 rounded" />
        <div className="pt-2 border-t border-slate-100 flex justify-between">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-3 w-8 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
