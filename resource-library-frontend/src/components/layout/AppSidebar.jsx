import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Home, BookOpen, Upload, User, LogOut, ChevronRight, Sparkles, Layers,
  Compass, ExternalLink
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { cn } from '../../lib/utils';
import { getInitials } from '../../lib/utils';

const navItems = [
  { label: 'Overview', to: '/home', icon: Home, badge: null },
  { label: 'Library Browse', to: '/library', icon: BookOpen, badge: null },
  { label: 'Upload Document', to: '/upload', icon: Upload, badge: 'New' },
];

export function AppSidebar() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate('/');
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between select-none z-30 shadow-[1px_0_8px_rgba(0,0,0,0.01)]">
      {/* Top Header */}
      <div>
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <Logo size="default" />
        </div>

        {/* Navigation Sections */}
        <div className="px-4 py-6 space-y-6">
          <div>
            <p className="px-3 mb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Main Menu
            </p>
            <nav className="space-y-1.5">
              {navItems.map(({ label, to, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/80'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={cn(
                        'transition-colors',
                        'group-hover:text-indigo-600'
                      )}
                      strokeWidth={2}
                    />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700 font-mono">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 mb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Account & Settings
            </p>
            <nav className="space-y-1.5">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <User size={17} strokeWidth={2} />
                <span>Profile & Stats</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Panel */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 m-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
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
