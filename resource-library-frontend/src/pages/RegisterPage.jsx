import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { register as registerApi, getUser } from '../api/auth';
import { setCredentials } from '../features/auth/authSlice';
import { getUserIdFromToken } from '../utils/jwtUtils';
import { Logo } from '../components/brand/Logo';

// Match backend regex constraints
const schema = z.object({
  username: z
    .string()
    .min(3, 'Username must be between 3 and 20 characters')
    .max(20, 'Username must be between 3 and 20 characters')
    .regex(/^[a-zA-Z0-9_]{3,20}$/, 'Letters, numbers, and underscore only (3-20 characters)'),
  email: z.string().email('Enter a valid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[@#$%^&+=]/, 'Must contain a special character (@, #, $, %, ^, &, +, =)'),
});

function PasswordCheckList({ value }) {
  const checks = [
    { label: '8+ chars', ok: value.length >= 8 },
    { label: 'Uppercase (A-Z)', ok: /[A-Z]/.test(value) },
    { label: 'Lowercase (a-z)', ok: /[a-z]/.test(value) },
    { label: 'Number (0-9)', ok: /[0-9]/.test(value) },
    { label: 'Special (@#$%^&+=)', ok: /[@#$%^&+=]/.test(value) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
      {checks.map(({ label, ok }) => (
        <span
          key={label}
          className={`flex items-center gap-1.5 text-[10px] font-mono font-medium transition-colors ${
            ok ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const livePassword = watch('password', '');

  async function onSubmit(data) {
    setLoading(true);
    setApiError('');
    try {
      const res = await registerApi(data);
      if (!res.success) throw new Error(res.message || 'Registration failed');
      const token = res.token;
      const userId = getUserIdFromToken(token);

      let user = { userId, username: data.username, email: data.email };
      try {
        const userRes = await getUser(userId);
        if (userRes.success) user = userRes.data;
      } catch {}

      dispatch(setCredentials({ token, user }));
      navigate('/library');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to complete registration.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F6] text-slate-900">
      {/* Left 50% Column */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12 xl:p-16 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="mesh-glow w-[500px] h-[500px] bg-indigo-600/30 -top-20 -left-20" />
        <div className="mesh-glow w-[400px] h-[400px] bg-emerald-500/20 -bottom-20 -right-20" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Logo className="[&_span]:text-white" />
        </div>

        {/* Middle Value Proposition Card */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase border border-emerald-500/30 mb-6">
            <Sparkles size={13} />
            Academic Resource Hub
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold font-serif leading-tight text-white mb-4">
            Discover and publish with fellow learners.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Create an account to upload class materials, read verified author resources, and exchange lecture notes.
          </p>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Full access to the complete document catalog</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Personal stock & upload management</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Community commentary & notes</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck size={15} /> Instant Activation
          </span>
          <span>Academic Edition</span>
        </div>
      </div>

      {/* Right 50% Column - Centered Form Container */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen relative">
        {/* Top-Right Navigation Link */}
        <div className="flex items-center justify-between lg:justify-end w-full">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/login"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all hover:bg-slate-50"
          >
            Already a member? Sign In →
          </Link>
        </div>

        {/* Centered Form */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-8">
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-900/5 border border-slate-200/80">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Join the academic resource network in under a minute.
              </p>
            </div>

            {apiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 mb-4">
                <AlertCircle size={15} className="flex-shrink-0" /> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  className="input-base text-xs py-2.5 px-3.5 rounded-xl"
                  placeholder="e.g. nivas_coder"
                  {...register('username')}
                />
                {errors.username && <p className="text-xs text-rose-500 mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-base text-xs py-2.5 px-3.5 rounded-xl"
                  placeholder="student@university.edu"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-base text-xs py-2.5 px-3.5 pr-10 rounded-xl"
                    placeholder="Create secure password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordCheckList value={livePassword} />
                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-3 text-xs font-bold shadow-md shadow-indigo-500/25 disabled:opacity-50 mt-2 rounded-xl"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 font-mono">
          Free and Open for Academic Sharing
        </div>
      </div>
    </div>
  );
}
