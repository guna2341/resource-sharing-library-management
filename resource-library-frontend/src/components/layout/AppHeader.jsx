import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, Shield, ShieldCheck, User, LogOut, Menu, X,
  ExternalLink, Sparkles, ChevronDown, CheckCircle2
} from 'lucide-react';
import { selectCurrentUser, logout, updateUser } from '../../features/auth/authSlice';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';
import { Logo } from '../brand/Logo';
import { getInitials } from '../../lib/utils';

export function AppHeader({ onToggleMobileMenu, breadcrumb }) {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  function handleLogout() {
    dispatch(logout());
    navigate('/');
  }

  function handleToggleRole() {
    const newRole = isAdmin ? 'MEMBER' : 'ADMIN';
    dispatch(updateUser({ role: newRole }));
    setIsUserMenuOpen(false);
  }

  // Derive readable breadcrumb from route if not explicitly passed
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTitle =
    breadcrumb ||
    (pathParts.length > 0
      ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
      : 'Overview');

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 sticky top-0 z-30 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        {/* Left: Mobile Menu Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-indigo-600 uppercase tracking-wider">
              Academic Hub
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700 capitalize">{currentTitle}</span>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-400 hover:text-slate-600 transition-all group shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Search size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span>Search repository or jump to workspace...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-500 border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications, Role Switcher & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* Quick Role Switcher Pill */}
          <button
            onClick={handleToggleRole}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono transition-all border ${
              isAdmin
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Click to toggle between Admin and Member mode for testing"
          >
            {isAdmin ? <Shield size={12} className="text-rose-600" /> : <ShieldCheck size={12} className="text-indigo-600" />}
            <span>{isAdmin ? 'Admin View' : 'Scholar View'}</span>
          </button>

          {/* Notification Bell */}
          <NotificationCenter />

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {user?.profileUrl ? (
                  <img src={user.profileUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
                ) : (
                  getInitials(user?.username || user?.email || 'User')
                )}
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 truncate">{user?.username || 'Member'}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'authenticated'}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-mono font-bold text-slate-600">
                      Role: {user?.role || 'MEMBER'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User size={15} /> My Profile & Stats
                  </Link>

                  <Link
                    to="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-medium"
                  >
                    <Shield size={15} /> Admin Portal
                  </Link>

                  <button
                    onClick={handleToggleRole}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-700 hover:bg-indigo-50 font-medium"
                  >
                    <Sparkles size={15} /> Switch to {isAdmin ? 'Scholar' : 'Admin'} Mode
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
