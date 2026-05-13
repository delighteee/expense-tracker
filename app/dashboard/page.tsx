import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/DashboardClient';

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
  const hasTransactions = !!(transactions && transactions.length > 0);

  const totalSpend = transactions?.reduce((sum, t) => {
    return t.direction === 'debit' ? sum + Number(t.amount) : sum;
  }, 0) ?? 0;

  return (
    <DashboardClient
      name={name}
      hasTransactions={hasTransactions}
      totalSpend={totalSpend}
      transactions={transactions ?? []}
    />
  );
}
