'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 pt-safe">
      <header className="px-6 pt-6 pb-6">
        <Logo size={36} />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Settings</h1>
      </header>

      <main className="flex-1 px-6 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button className="flex items-center justify-between w-full h-14 px-4 border-b border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[#0F6E56]" />
              <span className="text-sm font-medium text-gray-800">Notifications</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-12 w-full bg-red-50 text-red-600 font-semibold rounded-xl border border-red-200 disabled:opacity-60 active:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
