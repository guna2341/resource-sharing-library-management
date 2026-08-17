import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight, BookOpen, Upload, Star, ShieldCheck, Sparkles, FileText,
  Layers, Search, CheckCircle2, Cloud, ArrowUpRight, MessageSquare, Terminal
} from 'lucide-react';
import { useSelector } from 'react-redux';
import Lenis from 'lenis';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { getBooks } from '../api/books';
import { cn, coverGradient, fileTypeLabel, fileTypeColor } from '../lib/utils';
import { Logo } from '../components/brand/Logo';
import { ResourceCard } from '../components/resources/ResourceCard';

function Reveal({ children, delay = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('reader');

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    getBooks()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setBooks(res.data);
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Computer Science', 'Engineering', 'Research Papers', 'Mathematics', 'Notes'];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600">
      <LandingNavbar />

      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Ambient mesh gradient lights */}
        <div className="mesh-glow w-[500px] h-[500px] bg-indigo-200/50 top-10 left-1/2 -translate-x-1/2" />
        <div className="mesh-glow w-[400px] h-[400px] bg-emerald-100/40 top-40 right-10" />
        <div className="mesh-glow w-[450px] h-[450px] bg-amber-100/40 bottom-10 left-10" />

        <div className="container-editorial relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Announcement Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-800 mb-8 hover:border-indigo-300 transition-colors cursor-pointer"
              onClick={() => navigate('/library')}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Production Resource Management</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600 flex items-center gap-1 font-bold">
                Browse Collection <ArrowRight size={12} />
              </span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6"
            >
              The definitive repository for{' '}
              <span className="font-serif italic font-normal text-indigo-600 underline decoration-indigo-200 underline-offset-8">
                academic
              </span>{' '}
              & learning resources.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              An intelligent, high-density platform to explore, preview, and share books, lecture slides, research documents, and code notes.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
            >
              <button
                onClick={() => navigate(isAuthenticated ? '/library' : '/register')}
                className="btn-accent text-sm px-7 py-3.5 w-full sm:w-auto shadow-lg shadow-indigo-500/25"
              >
                <BookOpen size={16} />
                Explore the Library
                <ArrowRight size={15} />
              </button>
              <Link
                to="/upload"
                className="btn-ghost text-sm px-6 py-3.5 w-full sm:w-auto text-slate-700 bg-white"
              >
                <Upload size={16} className="text-slate-500" />
                Upload a Resource
              </Link>
            </motion.div>
          </div>

          {/* ── Interactive Hero Showcase Card ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-slate-200/80 via-white/80 to-slate-200/40 shadow-2xl border border-white/80"
          >
            <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-8 overflow-hidden shadow-sm">
              {/* Mockup Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono font-medium text-slate-400">
                    resource-engine v2.4 // active
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('reader')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg transition-all',
                      activeTab === 'reader' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Live Reader
                  </button>
                  <button
                    onClick={() => setActiveTab('versions')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg transition-all',
                      activeTab === 'versions' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Version Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg transition-all',
                      activeTab === 'security' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Storage S3
                  </button>
                </div>
              </div>

              {/* Mockup Content Body */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Mini Book Preview */}
                <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold uppercase">
                        PDF // v2.0
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">482 pages</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-2 leading-snug">
                      Distributed Systems Architecture & Design
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                      A comprehensive guide exploring consensus algorithms, Byzantine fault tolerance, replication strategies, and cloud object storage protocols.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Dr. Leslie Lamport</span>
                    <span className="text-emerald-600 font-mono font-bold text-[11px]">✓ Verified</span>
                  </div>
                </div>

                {/* Center / Right Feature Preview */}
                <div className="md:col-span-2 rounded-2xl bg-slate-900 text-white p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-2">
                        <Terminal size={14} />
                        Spring Boot JPA Engine + Supabase S3
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        STATUS: 200 OK
                      </span>
                    </div>

                    <p className="font-mono text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      <span className="text-indigo-400">GET</span> /api/v1/books/{'{bookId}'}<br />
                      <span className="text-slate-500">// Presigned S3 Storage URL Generated</span><br />
                      <span className="text-emerald-400">Response</span>: <span className="text-amber-300">{'{ "fileType": "PDF", "isCurrent": true, "version": 2 }'}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <p className="text-[10px] font-mono text-slate-400 uppercase">File Integrity</p>
                        <p className="text-sm font-bold text-white mt-0.5">SHA-256 Validated</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Access Protocol</p>
                        <p className="text-sm font-bold text-white mt-0.5">Presigned Temp URL</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Stateless JWT Authentication</span>
                    <Link to="/library" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
                      Open Library <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BENTO GRID CAPABILITIES ────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 border-t border-slate-200/80 bg-white">
        <div className="container-editorial">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono uppercase tracking-wider border border-indigo-100">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
                Built specifically for knowledge exchange.
              </h2>
              <p className="text-slate-600 text-base">
                Everything implemented is backed by production Spring Boot & S3 architecture.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Multi-versioning */}
            <Reveal delay={0.1} className="md:col-span-2">
              <div className="glass-card rounded-3xl p-8 bg-slate-50 border border-slate-200/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20">
                    <Layers size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Multi-Version Document Evolution
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                    Documents evolve over semesters and editions. Upload revisions, maintain historical versions via root ID pointers, and switch between active editions seamlessly.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                    rootBookId Pointers
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                    One-Click Version Activation
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                    Full Revision History
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Bento Card 2: S3 Storage */}
            <Reveal delay={0.2}>
              <div className="glass-card rounded-3xl p-8 bg-slate-900 text-white border border-slate-800 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                    <Cloud size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Supabase S3 Storage
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Direct multipart uploads with public image caching and secure presigned tokens for sensitive documents.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-400 font-mono">
                  Presigned Streaming · 0 Latency
                </div>
              </div>
            </Reveal>

            {/* Bento Card 3: In-Browser Reader */}
            <Reveal delay={0.3}>
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-md shadow-amber-500/20">
                    <BookOpen size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Native In-Browser Reader
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Read PDFs and course materials directly in a distraction-free dark canvas with full-screen support.
                  </p>
                </div>
                <Link to="/library" className="mt-6 font-semibold text-xs text-indigo-600 flex items-center gap-1">
                  Try Reader <ArrowRight size={13} />
                </Link>
              </div>
            </Reveal>

            {/* Bento Card 4: Discussion & Notes */}
            <Reveal delay={0.4} className="md:col-span-2">
              <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900 to-slate-950 text-white border border-slate-800 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                    <MessageSquare size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Real-time Discussion & Annotations
                  </h3>
                  <p className="text-indigo-200 text-sm leading-relaxed max-w-xl">
                    Exchange questions, study recommendations, and lecture insights with fellow students right on the document page.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-indigo-300">
                  <span>Author-attributed commenting</span>
                  <Link to="/register" className="btn-accent text-xs px-4 py-2">
                    Join Community
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── DISCOVERY SHOWCASE SECTION ────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#FAF9F6] border-t border-slate-200/80">
        <div className="container-editorial">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono uppercase tracking-wider border border-indigo-100">
                  Live Catalog
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                  Discover resources worth learning.
                </h2>
              </div>
              <Link to="/library" className="btn-primary text-xs px-5 py-2.5">
                Browse Complete Library <ArrowRight size={13} />
              </Link>
            </div>
          </Reveal>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Book Cards Grid */}
          {books.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center max-w-xl mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Library Catalog Ready</h3>
              <p className="text-xs text-slate-500 mb-6">
                Connect and upload documents to begin sharing resources.
              </p>
              <Link to="/upload" className="btn-accent text-xs px-5 py-2.5">
                Upload First Resource
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {books.slice(0, 8).map((book, i) => (
                <ResourceCard key={book.bookId} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FINAL CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="mesh-glow w-[600px] h-[600px] bg-indigo-600/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        <div className="container-editorial relative z-10 text-center max-w-3xl mx-auto">
          <Reveal>
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold tracking-wider uppercase border border-indigo-500/30">
              Join The Network
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-5 mb-6 text-balance">
              Start exploring and sharing knowledge today.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-10 leading-relaxed">
              Open access to learning materials for universities, study groups, and independent researchers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => navigate(isAuthenticated ? '/library' : '/register')}
                className="btn-accent text-sm px-8 py-3.5 w-full sm:w-auto"
              >
                Get Started Now <ArrowRight size={15} />
              </button>
              <Link
                to="/library"
                className="btn-ghost text-sm px-8 py-3.5 w-full sm:w-auto bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800"
              >
                Browse Public Library
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-slate-200/80 bg-white">
        <div className="container-editorial flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="text-xs text-slate-400 font-mono">
            © {new Date().getFullYear()} Resource Library. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link to="/library" className="hover:text-indigo-600 transition-colors">Library</Link>
            <Link to="/upload" className="hover:text-indigo-600 transition-colors">Upload</Link>
            <Link to="/profile" className="hover:text-indigo-600 transition-colors">Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
