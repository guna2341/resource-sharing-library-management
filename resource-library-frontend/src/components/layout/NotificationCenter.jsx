import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Award, BookOpen, Users, Star, MessageSquare, UserCheck, Sparkles } from 'lucide-react';
import { networkApi } from '../../api/network';

export function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  function refresh() {
    setNotifications(networkApi.getNotifications());
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = networkApi.markAllNotificationsRead();
    setNotifications(updated);
  };

  const clearAll = () => {
    networkApi.clearNotifications();
    setNotifications([]);
  };

  function handleNotificationClick(n) {
    if (n.bookId) {
      navigate(`/library/${n.bookId}`);
    } else if (n.authorId) {
      navigate('/network');
    }
    setIsOpen(false);
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'book_release':
        return { icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' };
      case 'follow':
        return { icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border border-emerald-100' };
      case 'post':
        return { icon: MessageSquare, color: 'text-purple-600 bg-purple-50 border border-purple-100' };
      case 'community':
        return { icon: Users, color: 'text-sky-600 bg-sky-50 border border-sky-100' };
      case 'streak':
        return { icon: Award, color: 'text-amber-600 bg-amber-50 border border-amber-100' };
      default:
        return { icon: Sparkles, color: 'text-slate-600 bg-slate-50 border border-slate-100' };
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Academic Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                    >
                      <Check size={12} /> Read all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                      title="Clear notifications"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No new academic alerts. You are completely caught up!
                  </div>
                ) : (
                  notifications.map((n) => {
                    const { icon: Icon, color } = getNotificationIcon(n.type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group ${
                          !n.read ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">{n.title}</p>
                            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 text-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Real-time Academic Dispatch Active
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
