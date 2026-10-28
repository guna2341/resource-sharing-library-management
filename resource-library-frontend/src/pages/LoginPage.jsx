import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { login as loginApi, getUser } from '../api/auth';
import { setCredentials } from '../features/auth/authSlice';
import { getUserIdFromToken } from '../utils/jwtUtils';
import { Logo } from '../components/brand/Logo';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    setLoading(true);
    setApiError('');
    try {
      const res = await loginApi(data);
      if (!res.success) throw new Error(res.message || 'Login failed');
      const token = res.token;
      const userId = getUserIdFromToken(token);

      let user = { userId };
      try {
        const userRes = await getUser(userId);
        if (userRes.success) user = userRes.data;
      } catch {}

      dispatch(setCredentials({ token, user }));
      navigate('/library');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to sign in. Please verify your credentials.';
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold tracking-wider uppercase border border-indigo-500/30 mb-6">
            <Sparkles size={13} />
            Academic Resource Hub
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold font-serif leading-tight text-white mb-4">
            Knowledge grows when freely shared.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Access thousands of peer-uploaded textbooks, research notes, slide decks, and code documentation.
          </p>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Multi-version historical document tracking</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Fast presigned Supabase S3 streaming</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Distraction-free in-browser reading suite</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck size={15} /> Stateless JWT Security
          </span>
          <span>Version 2.4</span>
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
            to="/register"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all hover:bg-slate-50"
          >
            Need an account? Register →
          </Link>
        </div>

        {/* Centered Form */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-8">
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-900/5 border border-slate-200/80">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your credentials to access your library collection.
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
                    placeholder="••••••••"
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
                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-3 text-xs font-bold shadow-md shadow-indigo-500/25 disabled:opacity-50 mt-2 rounded-xl"
              >
                {loading ? 'Signing In...' : 'Sign In to Account'}
              </button>
            </form>

            {/* Quick Demo Evaluation Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                Quick Evaluation Mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSubmit({ email: 'scholar@university.edu', password: 'Password123!' })}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Lead Scholar</p>
                  <p className="text-[10px] text-slate-400 font-mono">1-Click Sign In</p>
                </button>
                <button
                  type="button"
                  onClick={() => onSubmit({ email: 'admin@library.enterprise.edu', password: 'Password123!' })}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600">Admin Principal</p>
                  <p className="text-[10px] text-slate-400 font-mono">1-Click Sign In</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 font-mono">
          Protected by Resource Library End-to-End Encryption
        </div>
      </div>
    </div>
  );
}
