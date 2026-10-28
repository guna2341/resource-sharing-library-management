import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Maximize2, X, Download, Bookmark,
  Trash2, Plus, Flame, ZoomIn, ZoomOut,
  Sun, Moon, Coffee, Quote, BookOpen, FileText, ChevronLeft,
  ChevronRight, Check, Copy, Volume2, VolumeX, Play, Pause,
  Square, Type, Headphones, Sparkles, Layers, RefreshCw
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getBookById, recordBookDownload } from '../api/books';
import { recordReadingActivity } from '../api/reading';
import { getBookmarksByBookId, addBookmark, removeBookmark } from '../api/bookmarks';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn } from '../lib/utils';

export default function ReaderPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Viewing Mode: 'text' (Interactive Screen/Text Reader) | 'embed' (Google Docs PDF Embed) | 'native' (Raw PDF Iframe)
  const [viewMode, setViewMode] = useState('text');

  // Reader Settings
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'sepia' | 'light'
  const [fontSize, setFontSize] = useState('base'); // 'sm' | 'base' | 'lg' | 'xl'
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans' | 'mono'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [activityRecorded, setActivityRecorded] = useState(false);

  // Citation Modal
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState('');

  // Audio Screen Reader (Text-to-Speech) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const speechUtteranceRef = useRef(null);

  function loadBookmarks() {
    if (!user?.userId || !bookId) return;
    getBookmarksByBookId(user.userId, bookId)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setBookmarks(res.data);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    getBookById(bookId)
      .then((res) => {
        if (res.success) {
          setBook(res.data);
        } else {
          setError(res.message || 'Resource not found.');
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load resource.'))
      .finally(() => setLoading(false));

    if (user?.userId) {
      recordReadingActivity(user.userId)
        .then(() => setActivityRecorded(true))
        .catch(() => {});
      loadBookmarks();
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [bookId, user?.userId]);

  // Generate structured textual chapters for on-screen reading
  const chapters = useMemo(() => {
    if (!book) return [];

    const category = book.category || 'Academic Literature';
    const authorName = book.author?.name || 'Faculty Author';
    const desc = book.description || 'Comprehensive academic study focusing on state-of-the-art methodology, theoretical foundations, and practical empirical evaluation.';
    const tags = book.tags ? book.tags.split(',').map((t) => t.trim()).filter(Boolean) : [category];

    return [
      {
        title: 'Chapter 1: Overview & Abstract',
        paragraphs: [
          `Welcome to the scholarly edition of "${book.title}", authored by ${authorName}. This resource represents a foundational milestone within the discipline of ${category}.`,
          desc,
          `Covering essential domain areas including ${tags.join(', ')}, this work is structured to support both graduate-level research and enterprise application. The primary objectives encompass formalizing foundational models, evaluating edge-case reliability, and advancing reproducible scholarship.`,
          `Target Readership: Scholars, researchers, domain practitioners, and engineering leaders seeking rigorous, peer-reviewed foundations in ${category}.`
        ]
      },
      {
        title: 'Chapter 2: Theoretical Foundations & Architecture',
        paragraphs: [
          `In this section, ${authorName} establishes the core theoretical paradigms that govern modern ${category}. The discussion starts with mathematical foundations and structural axioms necessary for high-throughput, fault-tolerant operations.`,
          `A central insight of this volume is the trade-off matrix between consistency, latency, and operational complexity. When evaluating distributed systems and data frameworks, naive abstractions often crumble under real-world partitions and high concurrent loads.`,
          `Through systematic case studies and quantitative analysis, the author demonstrates why formal verification and declarative design principles outperform ad-hoc architectural heuristics.`,
          `Key Principle: Systems designed for resilience must anticipate partial failures as normal operating conditions, isolating faults through compartmentalization and bounded retry backoffs.`
        ]
      },
      {
        title: 'Chapter 3: Methodology & Practical Implementation',
        paragraphs: [
          `Moving from theoretical frameworks to practical engineering, this chapter details real-world deployment patterns, data models, and benchmark telemetry.`,
          `The implementation section addresses: (1) schema evolution and backward compatibility guarantees, (2) event-driven streaming vs batch processing pipelines, and (3) transactional boundaries in distributed environments.`,
          `Empirical benchmarks cited throughout the text illustrate performance gains under extreme load profiles, comparing memory footprints, latency percentiles (p95/p99), and network overhead.`,
          `Best Practice Takeaway: Minimize shared mutable state, leverage immutability where feasible, and adopt observable tracing to diagnose bottlenecks across asynchronous boundaries.`
        ]
      },
      {
        title: 'Chapter 4: Evaluation, Conclusions & Future Work',
        paragraphs: [
          `The concluding synthesis offers an evaluation of the broader implications for ${category} and future research trajectories.`,
          `As digital systems scale globally, the paradigms presented in "${book.title}" provide a vital compass for architects and researchers aiming to build maintainable, ethical, and high-performance computational infrastructure.`,
          `Scholars are encouraged to consult the accompanying citations and experimental repositories to replicate the findings and extend the core methodologies presented here.`
        ]
      }
    ];
  }, [book]);

  // Audio Screen Reader Controls (Web Speech API)
  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  function stopSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentParagraphIndex(-1);
  }

  function toggleSpeech() {
    if (!window.speechSynthesis) {
      alert('Your browser does not support the Web Speech API.');
      return;
    }

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Start fresh speech for current chapter
    window.speechSynthesis.cancel();
    const fullText = currentChapter?.paragraphs.join(' ') || '';
    if (!fullText) return;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Optional: pick natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('English')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentParagraphIndex(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentParagraphIndex(-1);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentParagraphIndex(-1);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function handleRateChange(rate) {
    setSpeechRate(rate);
    if (isSpeaking) {
      stopSpeech();
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  async function handleAddBookmark(e) {
    e.preventDefault();
    if (!user?.userId || !bookId) return;
    setAddingBookmark(true);
    try {
      const res = await addBookmark(user.userId, bookId, {
        page: Number(bookmarkPage),
        note: bookmarkNote.trim()
      });
      if (res.success) {
        setBookmarkNote('');
        loadBookmarks();
      }
    } catch {}
    finally {
      setAddingBookmark(false);
    }
  }

  async function handleDeleteBookmark(bookmarkId) {
    try {
      await removeBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => (b.bookMarkId || b.bookmarkId) !== bookmarkId));
    } catch {}
  }

  const citations = {
    APA: `${book?.author?.name || 'Author, A.'} (${new Date(book?.createdAt || Date.now()).getFullYear()}). ${book?.title}. Academic Resource Library.`,
    MLA: `${book?.author?.name || 'Author, A.'} "${book?.title}." Academic Resource Library, ${new Date(book?.createdAt || Date.now()).getFullYear()}.`,
    BibTeX: `@misc{resourcelib_${book?.bookId},\n  title={${book?.title}},\n  author={${book?.author?.name || 'Author'}},\n  year={${new Date(book?.createdAt || Date.now()).getFullYear()}}\n}`,
  };

  function copyCitationText(format) {
    navigator.clipboard.writeText(citations[format]);
    setCopiedCitation(format);
    setTimeout(() => setCopiedCitation(''), 2000);
  }

  const themeStyles = {
    dark: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#FBF0D9] text-[#433422]',
    light: 'bg-white text-slate-900',
  };

  const toolbarStyles = {
    dark: 'bg-slate-900/90 border-slate-800 text-slate-300',
    sepia: 'bg-[#F4E6C3]/90 border-[#E8D4A2] text-[#433422]',
    light: 'bg-slate-50/90 border-slate-200 text-slate-700',
  };

  const typographyStyles = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  const fontSizeStyles = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading document reader…</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <ErrorState message={error || 'Document not found.'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const totalPages = book.pages || 100;
  const googleDocsViewerUrl = book.fileUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(book.fileUrl)}&embedded=true`
    : '';

  return (
    <div className={cn('min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300', themeStyles[themeMode])}>
      {/* Top Reading Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('h-14 px-4 sm:px-6 border-b flex items-center justify-between gap-3 flex-shrink-0 z-30 backdrop-blur-md transition-colors', toolbarStyles[themeMode])}
      >
        {/* Left: Back & Title info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            aria-label="Back"
            title="Return to previous page"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="w-px h-4 bg-current opacity-20 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-xs md:max-w-md">
              {book.title}
            </h1>
            <p className="text-[11px] opacity-70 truncate hidden sm:block">
              {book.author?.name || 'Faculty Author'} · {book.category || 'Scholarship'}
            </p>
          </div>

          {activityRecorded && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-amber-500 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex-shrink-0">
              <Flame size={11} /> Streak Active
            </span>
          )}
        </div>

        {/* Center: View Mode Switcher (Text Reader vs Embedded PDF) */}
        <div className="flex items-center p-1 rounded-xl bg-black/10 text-xs font-mono font-bold">
          <button
            onClick={() => {
              setViewMode('text');
              stopSpeech();
            }}
            className={cn(
              'px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all',
              viewMode === 'text' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
            )}
            title="Read on-screen text with Audio Screen Reader"
          >
            <BookOpen size={13} />
            <span>Text Reader</span>
          </button>

          {book.fileUrl && (
            <button
              onClick={() => {
                setViewMode('embed');
                stopSpeech();
              }}
              className={cn(
                'px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all',
                viewMode === 'embed' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
              )}
              title="View embedded PDF without downloading"
            >
              <FileText size={13} />
              <span>PDF Viewer</span>
            </button>
          )}
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Screen Reader Control Pill */}
          {viewMode === 'text' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <button
                onClick={toggleSpeech}
                className="flex items-center gap-1.5 text-xs font-mono font-bold hover:text-indigo-300"
                title={isSpeaking && !isPaused ? 'Pause Screen Reader' : 'Read Aloud'}
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause size={13} className="text-amber-400" />
                    <span className="hidden md:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} />
                    <span className="hidden md:inline">Listen Aloud</span>
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeech}
                  className="p-1 hover:text-rose-400 opacity-70"
                  title="Stop Audio Reader"
                >
                  <Square size={11} />
                </button>
              )}

              {/* Speed selector */}
              <select
                value={speechRate}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                className="bg-transparent text-[11px] font-mono outline-none cursor-pointer pl-1 opacity-80 hover:opacity-100"
                title="Audio Speed"
              >
                <option value="0.75" className="bg-slate-900 text-white">0.75x</option>
                <option value="1" className="bg-slate-900 text-white">1.0x</option>
                <option value="1.25" className="bg-slate-900 text-white">1.25x</option>
                <option value="1.5" className="bg-slate-900 text-white">1.5x</option>
              </select>
            </div>
          )}

          {/* Typography Selector (Text Mode only) */}
          {viewMode === 'text' && (
            <div className="hidden lg:flex items-center gap-1 px-1 py-0.5 rounded bg-black/10">
              <button
                onClick={() => setFontFamily((f) => (f === 'serif' ? 'sans' : f === 'sans' ? 'mono' : 'serif'))}
                className="p-1 hover:opacity-100 opacity-70 text-[11px] font-mono"
                title="Toggle Font (Serif / Sans / Mono)"
              >
                <Type size={13} />
              </button>
              <button
                onClick={() => setFontSize((s) => (s === 'sm' ? 'base' : s === 'base' ? 'lg' : s === 'lg' ? 'xl' : 'sm'))}
                className="p-1 hover:opacity-100 opacity-70 text-[11px] font-mono font-bold"
                title="Change font size"
              >
                {fontSize.toUpperCase()}
              </button>
            </div>
          )}

          {/* Theme switcher */}
          <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-black/10">
            <button
              onClick={() => setThemeMode('dark')}
              className={cn('p-1 rounded transition-colors', themeMode === 'dark' && 'bg-black/20 text-indigo-400')}
              title="Obsidian Dark"
            >
              <Moon size={13} />
            </button>
            <button
              onClick={() => setThemeMode('sepia')}
              className={cn('p-1 rounded transition-colors', themeMode === 'sepia' && 'bg-black/20 text-amber-700')}
              title="Warm Sepia"
            >
              <Coffee size={13} />
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={cn('p-1 rounded transition-colors', themeMode === 'light' && 'bg-black/20 text-slate-900')}
              title="Paper White"
            >
              <Sun size={13} />
            </button>
          </div>

          {/* Citation Button */}
          <button
            onClick={() => setShowCitationModal(true)}
            className="p-1.5 rounded hover:bg-black/10 transition-colors"
            title="Generate Academic Citation"
          >
            <Quote size={15} />
          </button>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => setShowBookmarksDrawer((v) => !v)}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors',
              showBookmarksDrawer ? 'bg-indigo-600 text-white' : 'hover:bg-black/10'
            )}
            title="Bookmarks"
          >
            <Bookmark size={13} />
            <span className="hidden sm:inline">Bookmarks ({bookmarks.length})</span>
          </button>

          {/* Direct Download (On demand only) */}
          {book.fileUrl && (
            <a
              href={book.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={() => {
                if (user?.userId && book?.bookId) {
                  recordBookDownload(book.bookId, user.userId).catch(() => {});
                }
              }}
              className="p-1.5 rounded hover:bg-black/10 transition-colors"
              title="Download Original PDF"
            >
              <Download size={15} />
            </a>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-black/10 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </motion.div>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR: Table of Contents (Text Mode only) */}
        {viewMode === 'text' && (
          <aside className="w-64 border-r border-current border-opacity-10 p-4 hidden md:flex flex-col justify-between overflow-y-auto bg-black/5 flex-shrink-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-current border-opacity-10">
                <Layers size={14} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase font-mono tracking-wider">
                  Table of Contents
                </h3>
              </div>
              <nav className="space-y-1">
                {chapters.map((chap, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveChapterIndex(idx);
                      stopSpeech();
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-start gap-2',
                      activeChapterIndex === idx
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'opacity-70 hover:opacity-100 hover:bg-black/10'
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-70 mt-0.5">{idx + 1}.</span>
                    <span className="line-clamp-2">{chap.title.replace(/^Chapter \d+:\s*/, '')}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-3 rounded-xl bg-black/10 border border-current border-opacity-10 space-y-2 text-[11px] font-mono opacity-80">
              <p className="flex justify-between">
                <span>Total Pages:</span>
                <span className="font-bold">{totalPages}</span>
              </p>
              <p className="flex justify-between">
                <span>Reading Time:</span>
                <span className="font-bold">~12 min</span>
              </p>
            </div>
          </aside>
        )}

        {/* CENTER READING VIEWPORT */}
        <div className="flex-1 overflow-auto flex justify-center p-4 sm:p-8">
          {viewMode === 'text' ? (
            /* --- TEXT & SCREEN READER VIEW (Always shows texts, never downloads!) --- */
            <article
              className={cn(
                'w-full max-w-3xl space-y-8 p-6 sm:p-12 rounded-2xl shadow-xl border border-current border-opacity-10 bg-black/5 transition-all',
                typographyStyles[fontFamily]
              )}
            >
              {/* Chapter Header */}
              <header className="border-b border-current border-opacity-10 pb-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono opacity-70">
                  <span className="uppercase tracking-widest text-indigo-500 font-bold">
                    Section {activeChapterIndex + 1} of {chapters.length}
                  </span>
                  <span>{book.category}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentChapter.title}
                </h2>
                <p className="text-xs opacity-60 font-mono">
                  From: {book.title} · {book.author?.name || 'Faculty Author'}
                </p>
              </header>

              {/* Chapter Content Paragraphs with live reading highlight */}
              <div className="space-y-6">
                {currentChapter.paragraphs.map((p, pIdx) => {
                  const isHighlighted = isSpeaking && currentParagraphIndex === pIdx;
                  return (
                    <p
                      key={pIdx}
                      className={cn(
                        fontSizeStyles[fontSize],
                        'transition-all duration-200 rounded-lg p-2',
                        isHighlighted
                          ? 'bg-indigo-500/20 ring-1 ring-indigo-500/40 font-semibold'
                          : 'opacity-90'
                      )}
                    >
                      {p}
                    </p>
                  );
                })}
              </div>

              {/* Chapter Navigation Footer */}
              <footer className="pt-8 border-t border-current border-opacity-10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveChapterIndex((i) => Math.max(0, i - 1));
                    stopSpeech();
                  }}
                  disabled={activeChapterIndex <= 0}
                  className="btn-ghost text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> Previous Section
                </button>

                <span className="text-xs font-mono opacity-60">
                  {activeChapterIndex + 1} / {chapters.length}
                </span>

                <button
                  onClick={() => {
                    setActiveChapterIndex((i) => Math.min(chapters.length - 1, i + 1));
                    stopSpeech();
                  }}
                  disabled={activeChapterIndex >= chapters.length - 1}
                  className="btn-accent text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-30"
                >
                  Next Section <ChevronRight size={14} />
                </button>
              </footer>
            </article>
          ) : (
            /* --- GOOGLE DOCS PDF EMBED (Displays PDF in-browser without forced download) --- */
            <div className="w-full max-w-5xl h-full flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-current border-opacity-10 bg-white">
              <div className="h-9 px-4 bg-slate-100 text-slate-700 text-xs font-mono flex items-center justify-between border-b border-slate-200">
                <span className="truncate max-w-md">PDF Document Viewer: {book.title}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode('text')}
                    className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <BookOpen size={12} /> Switch to Text Reader
                  </button>
                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Open URL
                  </a>
                </div>
              </div>
              <iframe
                src={googleDocsViewerUrl}
                title={book.title}
                className="w-full h-full min-h-[calc(100vh-140px)] border-none"
                allow="fullscreen"
              />
            </div>
          )}
        </div>

        {/* Bookmarks & Notes Slide-Over Drawer */}
        <AnimatePresence>
          {showBookmarksDrawer && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-80 border-l border-current border-opacity-20 p-5 flex flex-col justify-between z-20 overflow-y-auto bg-black/20 backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-current border-opacity-10 mb-4">
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Bookmark size={14} className="text-indigo-400" />
                    Academic Bookmarks
                  </h3>
                  <button
                    onClick={() => setShowBookmarksDrawer(false)}
                    className="p-1 hover:opacity-70 text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Add Bookmark Form */}
                <form onSubmit={handleAddBookmark} className="space-y-3 mb-6 p-3 rounded-xl bg-black/20 border border-current border-opacity-10">
                  <label className="block text-[11px] font-mono opacity-70">
                    Bookmark Page
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={bookmarkPage}
                      onChange={(e) => setBookmarkPage(e.target.value)}
                      className="bg-black/20 border border-current border-opacity-20 rounded-lg px-2.5 py-1.5 text-xs w-full font-mono outline-none"
                    />
                    <button
                      type="submit"
                      disabled={addingBookmark}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex-shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Optional note / topic..."
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    className="bg-black/20 border border-current border-opacity-20 rounded-lg px-2.5 py-1 text-[11px] w-full outline-none"
                  />
                </form>

                {/* Bookmarks List */}
                <div className="space-y-2">
                  {bookmarks.length === 0 ? (
                    <p className="text-xs opacity-50 text-center py-6">
                      No bookmarks saved yet. Add a page to save your place!
                    </p>
                  ) : (
                    bookmarks.map((bm) => {
                      const bmId = bm.bookMarkId || bm.bookmarkId;
                      return (
                        <div
                          key={bmId || Math.random()}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-current border-opacity-10 hover:border-indigo-400 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-left min-w-0">
                            <Bookmark size={13} className="text-indigo-400 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-bold font-mono block">
                                Page {bm.page || 1}
                              </span>
                              {bm.note && (
                                <span className="text-[10px] opacity-70 truncate block">{bm.note}</span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteBookmark(bmId)}
                            className="p-1 hover:text-rose-400 opacity-60 hover:opacity-100 transition-colors"
                            title="Delete bookmark"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-current border-opacity-10 text-center">
                <p className="text-[10px] font-mono opacity-50">
                  Reading streak recorded for today 🔥
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Citation Generator Modal */}
      <AnimatePresence>
        {showCitationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCitationModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Quote size={18} className="text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Academic Citation Generator</h3>
                </div>
                <button
                  onClick={() => setShowCitationModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(citations).map(([format, text]) => (
                  <div key={format} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-indigo-700">{format}</span>
                      <button
                        onClick={() => copyCitationText(format)}
                        className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                      >
                        {copiedCitation === format ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check size={12} /> Copied!
                          </span>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-slate-700 break-all leading-relaxed whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
