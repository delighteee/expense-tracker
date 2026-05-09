'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

const BANKS = [
  'GTBank', 'Access', 'Zenith', 'First Bank', 'UBA',
  'Opay', 'Palmpay', 'Kuda', 'Sterling', 'FCMB', 'Other',
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleBank(bank: string) {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (selectedBanks.length === 0) {
      setError('Please select at least one bank.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, banks: selectedBanks },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        name,
      });
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-safe pb-8">
      <div className="flex flex-col items-center pt-12 pb-8">
        <Logo size={48} />
        <p className="mt-2 text-gray-500 text-sm">Create your account</p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            placeholder="Chukwuemeka Obi"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
            placeholder="Minimum 8 characters"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Your Banks</label>
          <p className="text-xs text-gray-500">Select all banks you use</p>
          <div className="grid grid-cols-2 gap-2">
            {BANKS.map((bank) => {
              const selected = selectedBanks.includes(bank);
              return (
                <button
                  key={bank}
                  type="button"
                  onClick={() => toggleBank(bank)}
                  className={`h-11 px-3 rounded-xl border text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-[#E1F5EE] border-[#0F6E56] text-[#0F6E56]'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {bank}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 bg-[#0F6E56] text-white font-semibold rounded-xl mt-2 disabled:opacity-60 active:bg-[#0a5240] transition-colors"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0F6E56] font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
