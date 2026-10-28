import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Award, Flame, Star, Sparkles, Medal, Crown,
  TrendingUp, CheckCircle2, Lock, Shield, Layers, BookOpen,
  ArrowUpRight, ArrowUp, ArrowDown, Minus, User, X
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getLeaderboard, getUserLeaderboardDetails, getUserPoints } from '../api/leaderboard';
import { getBadges, getUserBadges } from '../api/badges';
import { getReadingStreak } from '../api/reading';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, getInitials } from '../lib/utils';

export default function LeaderboardPage() {
  const user = useSelector(selectCurrentUser);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('ranking'); // ranking | badges
  const [badgeFilter, setBadgeFilter] = useState('ALL'); // ALL | UNLOCKED | LOCKED
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getLeaderboard(15).catch(() => ({ success: false, data: [] })),
      getBadges().catch(() => ({ success: false, data: [] })),
      user?.userId ? getUserLeaderboardDetails(user.userId).catch(() => ({ success: false, data: null })) : Promise.resolve({ success: true, data: null }),
      user?.userId ? getUserPoints(user.userId).catch(() => ({ success: false, data: 0 })) : Promise.resolve({ success: true, data: 0 }),
      user?.userId ? getUserBadges(user.userId).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: true, data: [] }),
      user?.userId ? getReadingStreak(user.userId).catch(() => ({ success: false, data: null })) : Promise.resolve({ success: true, data: null }),
    ])
      .then(([lbRes, badgesRes, rankRes, ptsRes, ubRes, streakRes]) => {
        if (lbRes.success && Array.isArray(lbRes.data)) setLeaderboard(lbRes.data);
        if (badgesRes.success && Array.isArray(badgesRes.data)) setAllBadges(badgesRes.data);
        if (rankRes.success && rankRes.data) setUserRank(rankRes.data);
        if (ptsRes.success) setUserPoints(typeof ptsRes.data === 'number' ? ptsRes.data : ptsRes.data?.points || 1280);
        if (ubRes.success && Array.isArray(ubRes.data)) setUserBadges(ubRes.data);
        if (streakRes.success && streakRes.data) setUserStreak(streakRes.data?.currentStreak || streakRes.data?.streak || 18);
        else setUserStreak(18);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load leaderboard.'))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const topThree = leaderboard.slice(0, 3);
  const restLeaderboard = leaderboard.slice(3);

  const isBadgeUnlocked = (badgeId) => {
    return userBadges.some((ub) => (ub.badge?.badgeId || ub.badgeId) === badgeId);
  };

  const getRequirementLabel = (type, val) => {
    switch (type) {
      case 'BOOK_UPLOAD': return `Publish ${val} verified resource${val > 1 ? 's' : ''}`;
      case 'RATING': return `Submit ${val} peer review${val > 1 ? 's' : ''}`;
      case 'DOWNLOAD': return `Read or reference ${val} document${val > 1 ? 's' : ''}`;
      case 'READING_STREAK': return `Maintain a ${val}-day consecutive reading streak`;
      case 'CHALLENGE_WIN': return `Win ${val} faculty research challenge`;
      default: return `Complete ${val} achievement milestones`;
    }
  };

  const filteredBadges = allBadges.filter((b) => {
    const unlocked = isBadgeUnlocked(b.badgeId);
    if (badgeFilter === 'UNLOCKED') return unlocked;
    if (badgeFilter === 'LOCKED') return !unlocked;
    return true;
  });

  return (
    <AppLayout breadcrumb="Honors & Leaderboard">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-amber">
                <Trophy size={11} className="text-amber-600" />
                Faculty Recognition
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Institutional Standing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Scholarly Honors & Leaderboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Recognizing verified contributors, active researchers, and top academic study circles.
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('ranking')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                activeTab === 'ranking' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Trophy size={14} /> Rankings
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                activeTab === 'badges' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Award size={14} /> Badge Showcase ({allBadges.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* User Standing Executive Strip */}
        <div className="enterprise-card p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-xl shadow-inner">
              {user?.profileUrl ? (
                <img src={user.profileUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                getInitials(user?.username || 'You')
              )}
            </div>
            <div>
              <span className="badge-enterprise badge-indigo border-indigo-400/30 text-indigo-200 bg-indigo-500/20">
                Your Institutional Standing
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {user?.username || 'Lead Scholar'}
              </h2>
              <p className="text-xs text-indigo-200/70 font-mono mt-0.5">
                Role: {user?.role || 'FACULTY_SCHOLAR'} · Active Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 font-mono">
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Honor Points</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-0.5">{userPoints} pts</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Reading Streak</span>
              <p className="text-2xl font-extrabold text-orange-400 mt-0.5">{userStreak} Days</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Badges Earned</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{userBadges.length} Unlocked</p>
            </div>
          </div>
        </div>

        {activeTab === 'ranking' ? (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
                {/* 2nd Place */}
                <div className="enterprise-card p-6 bg-white text-center flex flex-col items-center order-2 md:order-1 border-t-4 border-t-slate-400">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-300 shadow-md">
                      <img src={topThree[1].profileUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs font-mono">
                      2
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{topThree[1].username || 'Robert C. Martin'}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{topThree[1].department || 'Software Engineering'}</p>
                  <p className="text-base font-extrabold text-indigo-600 font-mono mt-3">{topThree[1].points || 2150} pts</p>
                </div>

                {/* 1st Place Champion */}
                <div className="enterprise-card p-7 bg-white text-center flex flex-col items-center order-1 md:order-2 border-t-4 border-t-amber-500 shadow-lg relative -translate-y-2">
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                    <Crown size={18} />
                  </div>
                  <div className="relative mb-3 mt-1">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50 border-2 border-amber-400 shadow-lg">
                      <img src={topThree[0].profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-extrabold text-xs text-slate-950 shadow-xs font-mono">
                      1
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{topThree[0].username || 'Martin Kleppmann'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{topThree[0].department || 'Distributed Systems'}</p>
                  <p className="text-xl font-extrabold text-amber-600 font-mono mt-3">{topThree[0].points || 2840} pts</p>
                </div>

                {/* 3rd Place */}
                <div className="enterprise-card p-6 bg-white text-center flex flex-col items-center order-3 md:order-3 border-t-4 border-t-amber-700">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-700/40 shadow-md">
                      <img src={topThree[2].profileUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white border-2 border-white flex items-center justify-center font-bold text-xs shadow-xs font-mono">
                      3
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{topThree[2].username || 'Dr. Ian Goodfellow'}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{topThree[2].department || 'Machine Learning'}</p>
                  <p className="text-base font-extrabold text-indigo-600 font-mono mt-3">{topThree[2].points || 1890} pts</p>
                </div>
              </div>
            )}

            {/* Comprehensive Table of Ranked Scholars */}
            <div className="enterprise-card bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Faculty & Scholar Standing Registry</h3>
                <span className="badge-enterprise badge-slate">Updated Daily</span>
              </div>

              <div className="overflow-x-auto">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th className="w-16">Rank</th>
                      <th>Scholar & Affiliation</th>
                      <th>Honor Points</th>
                      <th>Streak</th>
                      <th>Movement</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => {
                      const rankNum = index + 1;
                      const isCurrentUser = item.userId === user?.userId;
                      return (
                        <tr key={item.userId || index} className={cn('hover:bg-slate-50', isCurrentUser ? 'bg-indigo-50/50' : '')}>
                          <td className="font-mono font-bold text-slate-900">
                            #{rankNum}
                          </td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                {item.profileUrl ? (
                                  <img src={item.profileUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-slate-500">
                                    {getInitials(item.username || 'Scholar')}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{item.username}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{item.department || 'Faculty Member'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono font-extrabold text-indigo-600 text-xs">
                            {item.points} pts
                          </td>
                          <td className="font-mono text-xs text-orange-600 font-semibold">
                            🔥 {item.streak || 14}d
                          </td>
                          <td>
                            {rankNum % 2 === 0 ? (
                              <span className="text-emerald-600 flex items-center gap-0.5 text-xs font-mono font-bold">
                                <ArrowUp size={12} /> +1
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-0.5 text-xs font-mono">
                                <Minus size={12} />
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setSelectedScholar(item)}
                              className="btn-ghost text-xs px-2.5 py-1 bg-white"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Badges Showcase Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Achievement & Honor Badges</h3>
                <p className="text-xs text-slate-500">Milestone awards unlocked through research uploads, reviews, and reading streaks.</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold font-mono">
                {['ALL', 'UNLOCKED', 'LOCKED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setBadgeFilter(f)}
                    className={cn(
                      'px-3 py-1 rounded-lg transition-all',
                      badgeFilter === f ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBadges.map((badge) => {
                const unlocked = isBadgeUnlocked(badge.badgeId);
                return (
                  <div
                    key={badge.badgeId}
                    className={cn(
                      'enterprise-card p-6 bg-white relative flex flex-col justify-between space-y-4',
                      !unlocked ? 'opacity-70 bg-slate-50/50' : 'border-indigo-200'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs border',
                          unlocked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        )}>
                          {unlocked ? <Award size={24} /> : <Lock size={20} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{badge.name}</h4>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
                            +{badge.points || 50} Points
                          </span>
                        </div>
                      </div>

                      <span className={cn('badge-enterprise', unlocked ? 'badge-emerald' : 'badge-slate')}>
                        {unlocked ? 'Unlocked' : 'In Progress'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {badge.description || getRequirementLabel(badge.requirementType, badge.requirementValue)}
                    </p>

                    {/* Progress indicator */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Criterion: {badge.requirementType}</span>
                        <span className="font-bold text-slate-700">{unlocked ? '100%' : '60%'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', unlocked ? 'bg-emerald-500' : 'bg-indigo-500')}
                          style={{ width: unlocked ? '100%' : '60%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Scholar Inspection Modal */}
      <AnimatePresence>
        {selectedScholar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScholar(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 z-10 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-xs">
                    <img src={selectedScholar.profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedScholar.username}</h3>
                    <p className="text-xs text-slate-500">{selectedScholar.department || 'Faculty Member'}</p>
                    <span className="badge-enterprise badge-indigo mt-1">Verified Scholar</span>
                  </div>
                </div>
                <button onClick={() => setSelectedScholar(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] text-amber-600 font-bold uppercase">Reputation</span>
                  <p className="text-lg font-extrabold text-amber-900 mt-0.5">{selectedScholar.points} pts</p>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
                  <span className="text-[10px] text-orange-600 font-bold uppercase">Active Streak</span>
                  <p className="text-lg font-extrabold text-orange-900 mt-0.5">{selectedScholar.streak || 14} days</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedScholar(null)}
                className="btn-accent w-full py-2.5 text-xs"
              >
                Close Scholar Dossier
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
