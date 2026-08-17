import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Maximize2, X, Download } from 'lucide-react';
import { getBookById } from '../api/books';
import { ErrorState } from '../components/common/States';
import { Logo } from '../components/brand/Logo';

export default function ReaderPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    getBookById(bookId)
      .then((res) => {
        if (res.success) setBook(res.data);
        else setError(res.message || 'Resource not found.');
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load resource.'))
      .finally(() => setLoading(false));
  }, [bookId]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
          <p className="text-sm text-[hsl(var(--muted))]">Loading document…</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState message={error || 'Document not found.'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-2.5 bg-[#111] border-b border-[#333] flex-shrink-0"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded hover:bg-[#333] transition-colors text-gray-400 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="w-px h-4 bg-[#333]" />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white truncate">{book.title}</p>
          {book.author?.name && (
            <p className="text-[11px] text-gray-500 truncate">{book.author.name}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={book.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-1.5 rounded hover:bg-[#333] transition-colors text-gray-400 hover:text-white flex items-center gap-1 text-xs"
            aria-label="Download document"
            title="Download Document"
          >
            <Download size={14} />
            <span className="hidden sm:inline text-xs text-gray-300">Download</span>
          </a>
          <a
            href={book.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-[#333] transition-colors text-gray-400 hover:text-white"
            aria-label="Open in new tab"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-[#333] transition-colors text-gray-400 hover:text-white"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </motion.div>

      {/* Document viewer */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={book.fileUrl}
          title={book.title}
          className="w-full h-full border-none"
          style={{ minHeight: 'calc(100vh - 52px)' }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
