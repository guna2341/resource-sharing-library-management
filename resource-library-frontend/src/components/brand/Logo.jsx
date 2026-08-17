import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { BookOpen } from 'lucide-react';

export function Logo({ className, size = 'default' }) {
  const isSm = size === 'sm';

  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2.5 select-none group',
        className
      )}
      aria-label="Resource Library home"
    >
      {/* Icon Emblem */}
      <div
        className={cn(
          'relative rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-950/10 border border-white/10 group-hover:scale-105 transition-transform duration-200',
          isSm ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-xl'
        )}
      >
        <BookOpen
          size={isSm ? 14 : 16}
          className="text-indigo-200 group-hover:text-white transition-colors"
          strokeWidth={2.2}
        />
        <div className="absolute inset-0 rounded-xl bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-[4px]" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-bold tracking-tight text-slate-900 leading-none group-hover:text-indigo-600 transition-colors',
              isSm ? 'text-[14px]' : 'text-[16px]'
            )}
            style={{ letterSpacing: '-0.025em' }}
          >
            Resource<span className="text-indigo-600 font-semibold">Library</span>
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-[9px] font-bold tracking-wider text-indigo-600 uppercase border border-indigo-100/80">
            PRO
          </span>
        </div>
      </div>
    </Link>
  );
}
