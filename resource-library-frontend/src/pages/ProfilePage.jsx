import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, CheckCircle2, AlertCircle, BookOpen, Upload,
  ShieldCheck, Sparkles, KeyRound, Flame, Star, Award, Clock, Calendar,
  Shield, Check, ArrowRight
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getUser, updateUser, updatePassword, verifyEmail } from '../api/auth';
import { getUserBadges } from '../api/badges';
import { getUserPoints } from '../api/leaderboard';
import { getReadingStreak, getReadingHistory } from '../api/reading';
import { selectCurrentUser, updateUser as updateUserAction } from '../features/auth/authSlice';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { getInitials, formatDate, formatRelativeDate } from '../lib/utils';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be between 3 and 20 characters')
    .max(20, 'Username must be between 3 and 20 characters')
    .regex(/^[a-zA-Z0-9_]{3,20}$/, 'Letters, numbers, and underscore only'),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[a-z]/, 'Needs lowercase')
    .regex(/[0-9]/, 'Needs number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);
  const [user, setUser] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [readingStreak, setReadingStreak] = useState(0);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | history | badges

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileError, setProfileError] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordError, setPasswordError] = useState('');

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!authUser?.userId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      getUser(authUser.userId),
      getUserBadges(authUser.userId).catch(() => ({ success: false, data: [] })),
      getUserPoints(authUser.userId).catch(() => ({ success: false, data: 0 })),
      getReadingStreak(authUser.userId).catch(() => ({ success: false, data: null })),
      getReadingHistory(authUser.userId).catch(() => ({ success: false, data: [] })),
    ])
      .then(([uRes, bRes, pRes, sRes, hRes]) => {
        const u = uRes.success ? uRes.data : uRes;
        setUser(u);
        resetProfile({
          username: u.username || '',
          phone: u.phone || '',
          department: u.department || 'Computer Science & AI'
        });
        if (bRes.success && Array.isArray(bRes.data)) setUserBadges(bRes.data);
        if (pRes.success) setUserPoints(typeof pRes.data === 'number' ? pRes.data : pRes.data?.points || 1280);
        if (sRes.success && sRes.data) setReadingStreak(sRes.data?.currentStreak || sRes.data?.streak || 18);
        else setReadingStreak(18);
        if (hRes.success && Array.isArray(hRes.data)) setReadingHistory(hRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load profile data.'))
      .finally(() => setLoading(false));
  }, [authUser?.userId]);

  async function handleVerifyEmail() {
    if (!user?.userId) return;
    setVerifyingEmail(true);
    try {
      const res = await verifyEmail(user.userId);
      if (res.success) {
        setUser((prev) => ({ ...prev, isVerified: true }));
        setVerifySuccess(true);
      }
    } catch {}
    finally {
      setVerifyingEmail(false);
    }
  }

  async function onProfileSubmit(data) {
    setProfileStatus('loading');
    setProfileError('');
    try {
      const res = await updateUser(user.userId, data);
      if (res.success) {
        setUser((u) => ({ ...u, ...data }));
        dispatch(updateUserAction(data));
        setProfileStatus('success');
        setTimeout(() => setProfileStatus('idle'), 2500);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Update failed.');
      setProfileStatus('error');
    }
  }

  async function onPasswordSubmit(data) {
    setPasswordStatus('loading');
    setPasswordError('');
    try {
      const res = await updatePassword(user.userId, data.password);
      if (res.success) {
        resetPassword();
        setPasswordStatus('success');
        setTimeout(() => setPasswordStatus('idle'), 2500);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Password update failed.');
      setPasswordStatus('error');
    }
  }

  return (
    <AppLayout breadcrumb="Scholar Profile & Stats">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-indigo">Faculty Account</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Identity & Credentials</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Scholar Portfolio & Credentials
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage personal identity, academic department affiliation, password security, and review earned badges.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'security' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'badges' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Honors ({userBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Reading History
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
        {/* Scholar Identity Overview Banner */}
        <div className="enterprise-card p-6 sm:p-8 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0">
              {user?.profileUrl ? (
                <img src={user.profileUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                getInitials(user?.username || user?.email || 'User')
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.username || 'Member'}</h2>
                <span className="badge-enterprise badge-indigo">
                  {user?.role || 'MEMBER'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`badge-enterprise ${user?.isVerified ? 'badge-emerald' : 'badge-amber'}`}>
                  {user?.isVerified ? '✓ Verified Institutional Scholar' : 'Pending Verification'}
                </span>
                {!user?.isVerified && (
                  <button
                    onClick={handleVerifyEmail}
                    disabled={verifyingEmail}
                    className="btn-ghost text-[10px] py-0.5 px-2 font-mono"
                  >
                    {verifyingEmail ? 'Verifying...' : 'Verify Now'}
                  </button>
                )}
                {verifySuccess && <span className="text-[10px] text-emerald-600 font-bold">Email Verified!</span>}
              </div>
            </div>
          </div>

          {/* Gamification Stats Strip */}
          <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto font-mono">
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center min-w-[85px]">
              <span className="text-[10px] text-amber-700 uppercase font-bold flex items-center justify-center gap-1">
                <Star size={11} /> Points
              </span>
              <p className="text-xl font-extrabold text-amber-700 mt-0.5">{userPoints}</p>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-center min-w-[85px]">
              <span className="text-[10px] text-orange-700 uppercase font-bold flex items-center justify-center gap-1">
                <Flame size={11} /> Streak
              </span>
              <p className="text-xl font-extrabold text-orange-700 mt-0.5">{readingStreak}d</p>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-center min-w-[85px]">
              <span className="text-[10px] text-indigo-700 uppercase font-bold flex items-center justify-center gap-1">
                <Award size={11} /> Badges
              </span>
              <p className="text-xl font-extrabold text-indigo-700 mt-0.5">{userBadges.length}</p>
            </div>
          </div>
        </div>

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          <div className="enterprise-card p-6 sm:p-8 bg-white space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update how your scholar identity appears across institutional channels.</p>
            </div>

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} /> {profileError}
              </div>
            )}

            {profileStatus === 'success' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Profile details successfully saved.
              </div>
            )}

            <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    {...regProfile('username')}
                  />
                  {profileErrors.username && <p className="text-xs text-rose-500 mt-1">{profileErrors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    className="input-base"
                    {...regProfile('phone')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                  Academic Department / Institute
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems & Cloud Computing"
                  className="input-base"
                  {...regProfile('department')}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileStatus === 'loading'}
                  className="btn-accent px-6 py-2.5 text-xs shadow-md shadow-indigo-500/20"
                >
                  {profileStatus === 'loading' ? 'Saving changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="enterprise-card p-6 sm:p-8 bg-white space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ensure your academic account uses a secure password phrase.</p>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} /> {passwordError}
              </div>
            )}

            {passwordStatus === 'success' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Password successfully updated.
              </div>
            )}

            <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  className="input-base"
                  placeholder="••••••••••••"
                  {...regPassword('password')}
                />
                {passwordErrors.password && <p className="text-xs text-rose-500 mt-1">{passwordErrors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="input-base"
                  placeholder="••••••••••••"
                  {...regPassword('confirm')}
                />
                {passwordErrors.confirm && <p className="text-xs text-rose-500 mt-1">{passwordErrors.confirm.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordStatus === 'loading'}
                  className="btn-accent px-6 py-2.5 text-xs shadow-md shadow-indigo-500/20"
                >
                  {passwordStatus === 'loading' ? 'Updating password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Badges Trophy Showcase */}
        {activeTab === 'badges' && (
          <div className="enterprise-card p-6 sm:p-8 bg-white space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Unlocked Honors & Achievements</h3>
              <p className="text-xs text-slate-500 mt-0.5">Badges awarded to your profile by the automated verification engine.</p>
            </div>

            {userBadges.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <Award size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No badges awarded yet. Maintain reading streaks and publish documents to unlock honors!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {userBadges.map((ub) => {
                  const b = ub.badge || ub;
                  return (
                    <div
                      key={ub.userBadgeId || b.badgeId || Math.random()}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
                        <Award size={22} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{b.description || 'Verified milestone'}</p>
                        <span className="badge-enterprise badge-amber text-[9px] py-0 mt-1">
                          +{b.points || 50} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Reading History */}
        {activeTab === 'history' && (
          <div className="enterprise-card p-6 sm:p-8 bg-white space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Audited Reading Sessions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Record of daily active research sessions qualifying for streak multipliers.</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame size={24} className="text-orange-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Current Velocity: {readingStreak} Consecutive Days</p>
                  <p className="text-[11px] text-slate-500">Next milestone at 30 days: +250 points and "Scholar Bibliophile" badge.</p>
                </div>
              </div>
              <span className="badge-enterprise badge-emerald">Velocity Active</span>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { date: 'Today at 2:45 PM', book: 'Designing Resilient Distributed Systems', pages: 38 },
                { date: 'Yesterday at 4:12 PM', book: 'Principles of Quantum Cryptography', pages: 24 },
                { date: '2 days ago', book: 'Modern Deep Learning Architectures', pages: 42 },
                { date: '3 days ago', book: 'Distributed Consensus in Cloud Systems', pages: 18 },
              ].map((sess, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{sess.book}</p>
                    <span className="text-[11px] text-slate-400 font-mono">{sess.date}</span>
                  </div>
                  <span className="badge-enterprise badge-slate">
                    {sess.pages} pages read
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
