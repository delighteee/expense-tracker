import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import BottomNav from '@/components/BottomNav';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(20);

  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', session.user.id)
    .single();

  const name = userProfile?.name ?? session.user.email?.split('@')[0] ?? 'there';
  const hasTransactions = transactions && transactions.length > 0;

  const totalSpend = transactions?.reduce((sum, t) => {
    return t.direction === 'debit' ? sum + Number(t.amount) : sum;
  }, 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen pb-20 pt-safe">
      {/* Header */}
      <header className="px-6 pt-4 pb-6 bg-[#0F6E56] text-white">
        <p className="text-sm text-white/70">Welcome back</p>
        <h1 className="text-2xl font-bold mt-0.5">{name} 👋</h1>
        {hasTransactions && (
          <div className="mt-4 bg-white/10 rounded-2xl p-4">
            <p className="text-sm text-white/70">Total spend (recent)</p>
            <p className="text-3xl font-bold mt-1">
              ₦{totalSpend.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-6 pt-6">
        {!hasTransactions ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-[#E1F5EE] rounded-full flex items-center justify-center mb-4">
              <Upload size={32} className="text-[#0F6E56]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">No transactions yet</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Upload a bank receipt or statement to start tracking your expenses
            </p>
            <Link
              href="/upload"
              className="mt-6 h-12 px-8 bg-[#0F6E56] text-white font-semibold rounded-xl flex items-center gap-2 active:bg-[#0a5240] transition-colors"
            >
              <Upload size={18} />
              Upload receipt
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-gray-800">Recent transactions</h2>
            {transactions.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.narration || t.beneficiary || 'Transaction'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.bank} · {t.category ?? 'Uncategorised'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
                  </div>
                  <p className={`text-base font-bold whitespace-nowrap ${t.direction === 'credit' ? 'text-[#0F6E56]' : 'text-gray-900'}`}>
                    {t.direction === 'credit' ? '+' : '-'}₦{Number(t.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
