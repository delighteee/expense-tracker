'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, Camera, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';

const CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Utilities & Bills',
  'Airtime & Data',
  'Shopping',
  'Health',
  'Rent & Housing',
  'Education',
  'Savings & Investment',
  'Business Expense',
  'Person-to-Person',
  'Subscriptions',
  'Other',
];

const BANKS = [
  'GTBank',
  'Access Bank',
  'Zenith Bank',
  'First Bank',
  'UBA',
  'Opay',
  'Palmpay',
  'Kuda',
  'Sterling',
  'FCMB',
  'Other',
];

type Stage = 'idle' | 'preview' | 'processing' | 'review' | 'saving';

interface ParsedReceipt {
  amount: string;
  date: string;
  narration: string;
  bank: string;
  category: string;
  direction: 'debit' | 'credit';
  image_ref: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<string | null>(null);

  // Editable confirmation fields
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [narration, setNarration] = useState('');
  const [bank, setBank] = useState('Other');
  const [category, setCategory] = useState('Other');
  const [direction, setDirection] = useState<'debit' | 'credit'>('debit');

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function resetToIdle() {
    setStage('idle');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setImageRef(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChosen(file: File) {
    setError(null);

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Please use a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);

    if (file.type !== 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    setStage('preview');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileChosen(file);
    e.target.value = '';
  }

  function openPicker(mode: 'camera' | 'gallery') {
    if (!fileInputRef.current) return;
    if (mode === 'camera') {
      fileInputRef.current.setAttribute('capture', 'environment');
    } else {
      fileInputRef.current.removeAttribute('capture');
    }
    fileInputRef.current.click();
  }

  async function processReceipt() {
    if (!selectedFile) return;
    setStage('processing');
    setError(null);

    try {
      const body = new FormData();
      body.append('file', selectedFile);

      const res = await fetch('/api/parse-receipt', { method: 'POST', body });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const data: ParsedReceipt = await res.json();

      setImageRef(data.image_ref);
      setAmount(data.amount ?? '');
      setDate(data.date || today());
      setNarration(data.narration ?? '');
      setBank(BANKS.includes(data.bank) ? data.bank : 'Other');
      setCategory(CATEGORIES.includes(data.category) ? data.category : 'Other');
      setDirection(data.direction === 'credit' ? 'credit' : 'debit');
      setStage('review');
    } catch (err) {
      console.error('[upload] processReceipt error:', err);
      // Graceful fallback — let user fill manually
      setAmount('');
      setDate(today());
      setNarration('');
      setBank('Other');
      setCategory('Other');
      setDirection('debit');
      setError('Could not read receipt automatically. Please fill in the details below.');
      setStage('review');
    }
  }

  async function saveTransaction() {
    setStage('saving');

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    const { error: dbError } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      amount: parseFloat(amount) || 0,
      date: date || today(),
      narration: narration.trim() || null,
      bank,
      category,
      direction,
      image_ref: imageRef,
      source: 'pwa',
    });

    if (dbError) {
      console.error('[upload] save error:', dbError.message);
      setError('Failed to save transaction. Please try again.');
      setStage('review');
      return;
    }

    router.push('/dashboard');
  }

  // ─── Stage: IDLE ────────────────────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Full-screen tap area */}
        <button
          className="flex-1 flex flex-col items-center justify-center gap-6 bg-primary-light w-full active:bg-[#c8edd9] transition-colors"
          onClick={() => openPicker('gallery')}
          aria-label="Tap to upload receipt"
        >
          <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Upload size={44} className="text-white" />
          </div>

          <div className="text-center px-10">
            <p className="text-2xl font-bold text-primary">Tap to upload receipt</p>
            <p className="text-sm text-gray-500 mt-2">
              Snap a photo, pick from gallery, or upload a PDF
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG · PNG · WebP · PDF · Max 5 MB</p>
          </div>

          {/* Quick-action pills */}
          <div className="flex gap-3 mt-2">
            <span
              role="presentation"
              className="px-5 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
            >
              📷 Camera
            </span>
            <span
              role="presentation"
              className="px-5 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
            >
              🖼 Gallery
            </span>
            <span
              role="presentation"
              className="px-5 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
            >
              📄 PDF
            </span>
          </div>
        </button>

        {/* Camera vs Gallery explicit buttons at bottom */}
        <div className="flex gap-3 px-6 py-5 bg-white border-t border-gray-100 pb-safe">
          <button
            onClick={() => openPicker('camera')}
            className="flex-1 h-12 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl active:bg-primary-dark"
          >
            <Camera size={18} />
            Camera
          </button>
          <button
            onClick={() => openPicker('gallery')}
            className="flex-1 h-12 flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold rounded-xl active:bg-primary-light"
          >
            <Upload size={18} />
            Browse
          </button>
        </div>

        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleInputChange}
        />

        <BottomNav />
      </div>
    );
  }

  // ─── Stage: PREVIEW ──────────────────────────────────────────────────────────
  if (stage === 'preview') {
    return (
      <div className="flex flex-col min-h-screen pb-20 pt-safe">
        <header className="flex items-center gap-2 px-4 pt-4 pb-4">
          <button
            onClick={resetToIdle}
            className="p-2 -ml-2 rounded-full active:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Receipt Preview</h1>
        </header>

        <main className="flex-1 px-6 flex flex-col gap-4 overflow-y-auto">
          {previewUrl ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected receipt"
                className="w-full object-contain max-h-[60vh]"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 flex flex-col items-center gap-3">
              <span className="text-5xl" role="img" aria-label="PDF">📄</span>
              <p className="text-sm font-semibold text-gray-800 text-center break-all">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-gray-500">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : ''}
              </p>
            </div>
          )}

          <button
            onClick={resetToIdle}
            className="h-11 flex items-center justify-center gap-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 active:bg-gray-50"
          >
            <RotateCcw size={15} />
            Choose a different file
          </button>

          <button
            onClick={processReceipt}
            className="h-12 bg-primary text-white font-semibold rounded-xl active:bg-primary-dark"
          >
            Process receipt
          </button>
        </main>

        <BottomNav />
      </div>
    );
  }

  // ─── Stage: PROCESSING ───────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8 bg-white">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-primary-light" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Reading your receipt...</p>
          <p className="text-sm text-gray-500 mt-2">Hang tight, this only takes a moment</p>
        </div>
      </div>
    );
  }

  // ─── Stage: REVIEW / SAVING ──────────────────────────────────────────────────
  if (stage === 'review' || stage === 'saving') {
    const isSaving = stage === 'saving';

    return (
      <div className="flex flex-col min-h-screen pt-safe">
        <header className="flex items-center gap-2 px-4 pt-4 pb-3 bg-white border-b border-gray-100">
          <button
            onClick={resetToIdle}
            disabled={isSaving}
            className="p-2 -ml-2 rounded-full active:bg-gray-100 disabled:opacity-40"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Confirm Details</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 pb-8">

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          )}

          {/* Amount + Direction card */}
          <div className="bg-primary-light rounded-2xl p-5">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Amount (NGN)
            </p>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-400">₦</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-3xl font-bold bg-transparent text-gray-900 outline-none placeholder:text-gray-300"
              />
            </div>
            {/* Debit / Credit toggle */}
            <div className="flex gap-2 mt-4">
              {(['debit', 'credit'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`flex-1 h-10 rounded-xl text-sm font-bold capitalize transition-colors ${
                    direction === d
                      ? d === 'debit'
                        ? 'bg-red-500 text-white'
                        : 'bg-primary text-white'
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {d === 'debit' ? '↑ Debit' : '↓ Credit'}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary"
            />
          </div>

          {/* Narration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
              Narration
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="What was this for?"
              className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary"
            />
          </div>

          {/* Bank */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
              Bank
            </label>
            <div className="relative">
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary appearance-none"
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={saveTransaction}
              disabled={isSaving}
              className="h-12 bg-primary text-white font-bold rounded-xl active:bg-primary-dark disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save transaction'
              )}
            </button>
            <button
              onClick={() => router.back()}
              disabled={isSaving}
              className="h-12 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 active:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
