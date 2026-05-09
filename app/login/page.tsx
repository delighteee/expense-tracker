'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-safe">
      <div className="flex flex-col items-center pt-16 pb-10">
        <Logo size={56} />
        <p className="mt-3 text-gray-500 text-sm">Track your Nigerian bank expenses</p>
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 bg-[#0F6E56] text-white font-semibold rounded-xl mt-2 disabled:opacity-60 active:bg-[#0a5240] transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-xl font-medium text-gray-700 bg-white disabled:opacity-60 active:bg-gray-50 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-gray-500 mt-8">
        No account?{' '}
        <Link href="/signup" className="text-[#0F6E56] font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}
