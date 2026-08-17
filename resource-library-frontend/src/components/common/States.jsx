import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertCircle size={18} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Unable to load</p>
      <p className="text-xs text-[hsl(var(--muted))] mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-sm flex items-center gap-2">
          <RefreshCw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet.', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[hsl(var(--elevated))] flex items-center justify-center mb-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="5" height="7" rx="1" fill="currentColor" className="text-[hsl(var(--muted))]" opacity="0.6" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" className="text-[hsl(var(--muted))]" opacity="0.4" />
          <rect x="2" y="11" width="12" height="3" rx="1" fill="currentColor" className="text-[hsl(var(--muted))]" opacity="0.4" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[hsl(var(--muted))] mb-4 max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
