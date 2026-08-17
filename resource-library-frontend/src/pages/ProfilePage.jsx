import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Lock, CheckCircle2, AlertCircle, BookOpen, Upload,
  ShieldCheck, Sparkles, KeyRound
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getUser, updateUser, updatePassword } from '../api/auth';
import { selectCurrentUser, updateUser as updateUserAction } from '../features/auth/authSlice';
import { AppSidebar } from '../components/layout/AppSidebar';
import { ErrorState } from '../components/common/States';
import { getInitials, formatDate } from '../lib/utils';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be between 3 and 20 characters')
    .max(20, 'Username must be between 3 and 20 characters')
    .regex(/^[a-zA-Z0-9_]{3,20}$/, 'Letters, numbers, and underscore only'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[a-z]/, 'Needs lowercase')
    .regex(/[0-9]/, 'Needs number')
    .regex(/[@#$%^&+=]/, 'Needs special character (@, #, $, %, ^, &, +, =)'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    getUser(authUser.userId)
      .then((res) => {
        const u = res.success ? res.data : res;
        setUser(u);
        resetProfile({ username: u.username || '', phone: u.phone || '' });
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load profile data.'))
      .finally(() => setLoading(false));
  }, [authUser?.userId]);

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
    <div className="flex min-h-screen bg-[#FAF9F6]">
      <div className="hidden lg:block"><AppSidebar /></div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="bg-white border-b border-slate-200/80 px-6 py-6 sticky top-0 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Profile</h1>
            <p className="text-xs text-slate-500 mt-1">Manage personal info, review uploaded statistics, and update security credentials.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 w-full space-y-8">
          {/* Top User Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {user?.profileUrl ? (
                  <img src={user.profileUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  getInitials(user?.username || user?.email || 'User')
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user?.username || 'Member'}</h2>
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${user?.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {user?.isVerified ? '✓ Verified Email' : 'Unverified'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold uppercase">
                    Role: {user?.role || 'USER'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex-1 sm:w-28">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Uploaded</span>
                <p className="text-xl font-extrabold text-indigo-600 mt-0.5">{user?.totalBooksUploaded ?? 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex-1 sm:w-28">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Stock</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{user?.totalBooksStock ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Edit Profile Form */}
            <div className="glass-card rounded-3xl p-6 bg-white">
              <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
                <User size={14} className="text-indigo-600" />
                Edit Profile Info
              </h3>

              <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Username
                  </label>
                  <input className="input-base text-xs" {...regProfile('username')} />
                  {profileErrors.username && <p className="text-xs text-rose-500 mt-1">{profileErrors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Phone Number
                  </label>
                  <input className="input-base text-xs" placeholder="e.g. 9876543210" {...regProfile('phone')} />
                </div>

                {profileStatus === 'success' && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Profile updated successfully.
                  </p>
                )}
                {profileError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} /> {profileError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={profileStatus === 'loading'}
                  className="btn-primary w-full text-xs py-2.5 disabled:opacity-50"
                >
                  {profileStatus === 'loading' ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="glass-card rounded-3xl p-6 bg-white">
              <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
                <KeyRound size={14} className="text-indigo-600" />
                Update Password
              </h3>

              <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="input-base text-xs"
                    placeholder="Min 8 chars, uppercase, special"
                    {...regPassword('password')}
                  />
                  {passwordErrors.password && <p className="text-xs text-rose-500 mt-1">{passwordErrors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="input-base text-xs"
                    placeholder="Repeat new password"
                    {...regPassword('confirm')}
                  />
                  {passwordErrors.confirm && <p className="text-xs text-rose-500 mt-1">{passwordErrors.confirm.message}</p>}
                </div>

                {passwordStatus === 'success' && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Password updated successfully.
                  </p>
                )}
                {passwordError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} /> {passwordError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={passwordStatus === 'loading'}
                  className="btn-accent w-full text-xs py-2.5 disabled:opacity-50"
                >
                  {passwordStatus === 'loading' ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
