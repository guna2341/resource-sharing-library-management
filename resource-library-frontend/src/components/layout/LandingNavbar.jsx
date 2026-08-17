import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { cn } from '../../lib/utils';

export function LandingNavbar() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3.5 px-4 sm:px-6">
        <div
          className={cn(
            'max-w-6xl mx-auto rounded-2xl transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between',
            scrolled
              ? 'glass-panel shadow-lg shadow-slate-900/5 border-slate-200/80'
              : 'bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm'
          )}
        >
          {/* Logo */}
          <Logo />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/50">
            <NavLink to="/library">
              <BookOpen size={14} className="text-slate-500" />
              Explore Library
            </NavLink>
            <a
              href="#features"
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-white flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-indigo-500" />
              Capabilities
            </a>
            <a
              href="#architecture"
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-white flex items-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-emerald-500" />
              S3 Storage & Security
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/library')}
                className="btn-accent text-xs px-4 py-2"
              >
                Dashboard <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-accent text-xs px-4 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-50 glass-panel rounded-2xl p-5 shadow-2xl border-slate-200 flex flex-col gap-3 md:hidden"
          >
            <Link
              to="/library"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-slate-800 py-2 flex items-center gap-2 border-b border-slate-100"
            >
              <BookOpen size={16} className="text-indigo-600" />
              Explore Library
            </Link>
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-slate-800 py-2 flex items-center gap-2 border-b border-slate-100"
            >
              <Sparkles size={16} className="text-indigo-600" />
              Capabilities
            </a>
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/library"
                  onClick={() => setMobileOpen(false)}
                  className="btn-accent text-sm text-center justify-center py-2.5"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-ghost text-sm text-center justify-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-accent text-sm text-center justify-center py-2.5"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all rounded-lg hover:bg-white flex items-center gap-1.5"
    >
      {children}
    </Link>
  );
}
