import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Home, BookOpen, Upload, User, LogOut, ChevronRight, Sparkles, Layers,
  Compass, ExternalLink, Users, Trophy, Heart, GraduationCap, ShieldAlert, X, Globe
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { cn, getInitials } from '../../lib/utils';

const navItems = [
  { label: 'Overview', to: '/home', icon: Home, badge: null },
  { label: 'Scholar Network', to: '/network', icon: Globe, badge: 'Feed' },
  { label: 'Library Catalog', to: '/library', icon: BookOpen, badge: 'All' },
  { label: 'Study Circles', to: '/communities', icon: Users, badge: 'Live' },
  { label: 'Leaderboard & Badges', to: '/leaderboard', icon: Trophy, badge: null },
  { label: 'Authors Directory', to: '/authors', icon: GraduationCap, badge: null },
  { label: 'Reading Wishlist', to: '/wishlist', icon: Heart, badge: null },
  { label: 'Upload Document', to: '/upload', icon: Upload, badge: 'New' },
];

export function AppSidebar({ isMobile = false, onClose }) {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  function handleLogout() {
    dispatch(logout());
    navigate('/');
    if (onClose) onClose();
  }

  function handleNavClick() {
    if (isMobile && onClose) {
      onClose();
    }
  }

  return (
    <aside className={cn(
      'w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between select-none z-30 shadow-[1px_0_8px_rgba(0,0,0,0.01)] overflow-y-auto',
      isMobile ? 'h-full w-full max-w-xs' : 'h-screen sticky top-0'
    )}>
      {/* Top Header */}
      <div>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <Logo size="default" />
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="px-4 py-5 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Academic Hub
            </p>
            <nav className="space-y-1">
              {navItems.map(({ label, to, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={cn(
                        'transition-colors',
                        'group-hover:text-indigo-600'
                      )}
                      strokeWidth={2}
                    />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-100/70 text-[9px] font-bold text-indigo-700 font-mono">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Account & Governance
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/profile"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <User size={16} strokeWidth={2} />
                <span>Profile & Stats</span>
              </NavLink>

              <NavLink
                to="/admin"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200',
                    isActive
                      ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={16} strokeWidth={2} className="text-rose-500" />
                  <span>Admin Portal</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[9px] font-mono font-bold text-rose-700">
                  Control
                </span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Panel */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 m-3 rounded-2xl border border-slate-200/80 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
              {user?.profileUrl ? (
                <img src={user.profileUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
              ) : (
                getInitials(user?.username || user?.email || 'User')
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user?.username || 'Member'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight font-mono">
                {user?.email || 'authenticated'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
