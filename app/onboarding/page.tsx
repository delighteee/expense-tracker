'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Upload, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

const BANKS = [
  'GTBank', 'Access', 'Zenith', 'First Bank', 'UBA',
  'Opay', 'Palmpay', 'Kuda', 'Sterling', 'FCMB', 'Other',
];

type Step = 'banks' | 'receipt' | 'notifications';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>('banks');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  function toggleBank(bank: string) {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  }

  async function handleBanksContinue() {
    if (selectedBanks.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({ data: { banks: selectedBanks } });
    }
    setStep('receipt');
  }

  async function handleNotifications() {
    setNotifLoading(true);
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notification_prefs').upsert({
        user_id: user.id,
        wa_weekly: true,
        wa_monthly: true,
        push_weekly: true,
        push_monthly: true,
      });
    }
    router.push('/dashboard');
    router.refresh();
  }

  const steps: Record<Step, number> = { banks: 1, receipt: 2, notifications: 3 };
  const currentStep = steps[step];

  return (
    <div className="flex flex-col min-h-screen px-6 pt-safe pb-8">
      {/* Progress */}
      <div className="pt-8 pb-6">
        <Logo size={36} />
        <div className="flex gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= currentStep ? 'bg-[#0F6E56]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Step {currentStep} of 3</p>
      </div>

      {step === 'banks' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your banks</h2>
            <p className="text-sm text-gray-500 mt-1">Which banks do you use? We&apos;ll help categorise your transactions.</p>
          </div>
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
          <button
            onClick={handleBanksContinue}
            disabled={selectedBanks.length === 0}
            className="h-12 bg-[#0F6E56] text-white font-semibold rounded-xl disabled:opacity-40 active:bg-[#0a5240] transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'receipt' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload your first receipt</h2>
            <p className="text-sm text-gray-500 mt-1">Take a photo of a bank receipt or debit alert SMS to log your first transaction.</p>
          </div>
          <div className="bg-[#E1F5EE] rounded-2xl p-8 flex flex-col items-center gap-4 border-2 border-dashed border-[#0F6E56]/40">
            <div className="w-16 h-16 bg-[#0F6E56] rounded-full flex items-center justify-center">
              <Upload size={28} className="text-white" />
            </div>
            <p className="text-sm text-center text-gray-600">Tap to upload a receipt image</p>
            <button
              onClick={() => setStep('notifications')}
              className="h-11 px-6 bg-[#0F6E56] text-white font-semibold rounded-xl text-sm active:bg-[#0a5240]"
            >
              Upload Receipt
            </button>
          </div>
          <button
            onClick={() => setStep('notifications')}
            className="text-sm text-gray-500 text-center underline"
          >
            Skip for now
          </button>
        </div>
      )}

      {step === 'notifications' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Stay on top of your spending</h2>
            <p className="text-sm text-gray-500 mt-1">Get weekly and monthly spending summaries via push notifications.</p>
          </div>
          <div className="bg-[#E1F5EE] rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#0F6E56] rounded-full flex items-center justify-center">
              <Bell size={28} className="text-white" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              {[
                { label: 'Weekly spending summary', desc: 'Every Monday morning' },
                { label: 'Monthly report', desc: 'First of every month' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white rounded-xl p-3">
                  <CheckCircle size={18} className="text-[#0F6E56] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleNotifications}
            disabled={notifLoading}
            className="h-12 bg-[#0F6E56] text-white font-semibold rounded-xl disabled:opacity-60 active:bg-[#0a5240] transition-colors"
          >
            {notifLoading ? 'Setting up…' : 'Enable notifications'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 text-center underline"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
