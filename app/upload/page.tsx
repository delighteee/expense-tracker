'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, Camera, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';
import {
  Box, Button, Circle, Flex, NativeSelectRoot, NativeSelectField, Spinner, Text,
} from '@chakra-ui/react';

const CATEGORIES = [
  'Food & Drinks', 'Transport', 'Utilities & Bills', 'Airtime & Data',
  'Shopping', 'Health', 'Rent & Housing', 'Education',
  'Savings & Investment', 'Business Expense', 'Person-to-Person',
  'Subscriptions', 'Other',
];

const BANKS = [
  'GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA',
  'Opay', 'Palmpay', 'Kuda', 'Sterling', 'FCMB', 'Other',
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
      setPreviewUrl(URL.createObjectURL(file));
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
    if (!session) { router.push('/login'); return; }
    const { error: dbError } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      amount: parseFloat(amount) || 0,
      date: date || today(),
      narration: narration.trim() || null,
      bank, category, direction,
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

  // ─── IDLE ────────────────────────────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <Flex direction="column" minH="100vh">
        <Flex
          as="button"
          flex={1}
          direction="column"
          align="center"
          justify="center"
          gap={6}
          bg="brand.50"
          w="full"
          onClick={() => openPicker('gallery')}
          _active={{ bg: 'brand.100' }}
          transition="background 0.2s"
          aria-label="Tap to upload receipt"
        >
          <Circle size="112px" bg="brand.500" shadow="lg">
            <Upload size={44} color="white" />
          </Circle>
          <Box textAlign="center" px={10}>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">Tap to upload receipt</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Snap a photo, pick from gallery, or upload a PDF
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>JPEG · PNG · WebP · PDF · Max 5 MB</Text>
          </Box>
          <Flex gap={3} mt={2}>
            {['📷 Camera', '🖼 Gallery', '📄 PDF'].map((label) => (
              <Box
                key={label}
                as="span"
                role="presentation"
                px={5}
                py={2}
                bg="white"
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
                shadow="sm"
              >
                {label}
              </Box>
            ))}
          </Flex>
        </Flex>

        <Flex
          gap={3}
          px={6}
          py={5}
          bg="white"
          borderTopWidth="1px"
          borderColor="gray.100"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <Button
            flex={1}
            h={12}
            borderRadius="xl"
            fontWeight="semibold"
            colorPalette="brand"
            onClick={() => openPicker('camera')}
          >
            <Camera size={18} />
            Camera
          </Button>
          <Button
            flex={1}
            h={12}
            borderRadius="xl"
            fontWeight="semibold"
            variant="outline"
            colorPalette="brand"
            onClick={() => openPicker('gallery')}
          >
            <Upload size={18} />
            Browse
          </Button>
        </Flex>

        {error && (
          <Box mx={6} mb={4} p={4} bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="xl">
            <Text fontSize="sm" color="red.700">{error}</Text>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleInputChange}
        />
        <BottomNav />
      </Flex>
    );
  }

  // ─── PREVIEW ─────────────────────────────────────────────────────────────────
  if (stage === 'preview') {
    return (
      <Flex
        direction="column"
        minH="100vh"
        pb={20}
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <Flex as="header" align="center" gap={2} px={4} pt={4} pb={4}>
          <Button
            variant="ghost"
            onClick={resetToIdle}
            p={2}
            ml={-2}
            borderRadius="full"
            aria-label="Go back"
          >
            <ChevronLeft size={24} color="#374151" />
          </Button>
          <Text fontSize="lg" fontWeight="bold" color="gray.900">Receipt Preview</Text>
        </Flex>

        <Flex as="main" flex={1} direction="column" px={6} gap={4} overflowY="auto">
          {previewUrl ? (
            <Box borderRadius="2xl" overflow="hidden" borderWidth="1px" borderColor="gray.200" bg="gray.50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Selected receipt" style={{ width: '100%', objectFit: 'contain', maxHeight: '60vh' }} />
            </Box>
          ) : (
            <Flex
              direction="column"
              align="center"
              gap={3}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="gray.200"
              bg="gray.50"
              p={10}
            >
              <Text fontSize="5xl" role="img" aria-label="PDF">📄</Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" textAlign="center" wordBreak="break-all">
                {selectedFile?.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : ''}
              </Text>
            </Flex>
          )}

          <Button
            onClick={resetToIdle}
            h={11}
            borderRadius="xl"
            variant="outline"
            borderColor="gray.300"
            color="gray.600"
            fontSize="sm"
            fontWeight="medium"
            _hover={{ bg: 'gray.50' }}
          >
            <RotateCcw size={15} />
            Choose a different file
          </Button>

          <Button
            onClick={processReceipt}
            h={12}
            borderRadius="xl"
            fontWeight="semibold"
            colorPalette="brand"
          >
            Process receipt
          </Button>
        </Flex>
        <BottomNav />
      </Flex>
    );
  }

  // ─── PROCESSING ──────────────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <Flex direction="column" align="center" justify="center" minH="100vh" gap={8} px={8} bg="white">
        <Box position="relative" w={24} h={24}>
          <Box position="absolute" inset={0} borderRadius="full" bg="brand.50" />
          <Flex position="absolute" inset={0} align="center" justify="center">
            <Spinner size="xl" color="brand.500" borderWidth="4px" />
          </Flex>
        </Box>
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="gray.900">Reading your receipt...</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>Hang tight, this only takes a moment</Text>
        </Box>
      </Flex>
    );
  }

  // ─── REVIEW / SAVING ─────────────────────────────────────────────────────────
  if (stage === 'review' || stage === 'saving') {
    const isSaving = stage === 'saving';
    return (
      <Flex
        direction="column"
        minH="100vh"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <Flex
          as="header"
          align="center"
          gap={2}
          px={4}
          pt={4}
          pb={3}
          bg="white"
          borderBottomWidth="1px"
          borderColor="gray.100"
        >
          <Button
            variant="ghost"
            onClick={resetToIdle}
            disabled={isSaving}
            p={2}
            ml={-2}
            borderRadius="full"
            aria-label="Go back"
          >
            <ChevronLeft size={24} color="#374151" />
          </Button>
          <Text fontSize="lg" fontWeight="bold" color="gray.900">Confirm Details</Text>
        </Flex>

        <Flex as="main" flex={1} overflowY="auto" direction="column" px={6} py={5} gap={5} pb={8}>
          {error && (
            <Box p={4} bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="xl">
              <Text fontSize="sm" color="orange.800">{error}</Text>
            </Box>
          )}

          {/* Amount + Direction */}
          <Box bg="brand.50" borderRadius="2xl" p={5}>
            <Text fontSize="xs" fontWeight="bold" color="brand.500" textTransform="uppercase" letterSpacing="widest" mb={2}>
              Amount (NGN)
            </Text>
            <Flex align="center" gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.400">₦</Text>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1,
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  background: 'transparent',
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </Flex>
            <Flex gap={2} mt={4}>
              {(['debit', 'credit'] as const).map((d) => (
                <Button
                  key={d}
                  flex={1}
                  h={10}
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="bold"
                  onClick={() => setDirection(d)}
                  bg={
                    direction === d
                      ? d === 'debit' ? 'red.500' : 'brand.500'
                      : 'white'
                  }
                  color={direction === d ? 'white' : 'gray.500'}
                  borderWidth="1px"
                  borderColor={direction === d ? 'transparent' : 'gray.200'}
                  _hover={{}}
                  transition="all 0.2s"
                >
                  {d === 'debit' ? '↑ Debit' : '↓ Credit'}
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Date */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="widest" px={1}>
              Date
            </Text>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                height: '3rem',
                padding: '0 1rem',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                outline: 'none',
              }}
            />
          </Box>

          {/* Narration */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="widest" px={1}>
              Narration
            </Text>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="What was this for?"
              style={{
                height: '3rem',
                padding: '0 1rem',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                outline: 'none',
              }}
            />
          </Box>

          {/* Bank */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="widest" px={1}>
              Bank
            </Text>
            <NativeSelectRoot>
              <NativeSelectField
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                h={12}
                px={4}
                bg="white"
                borderColor="gray.200"
                borderRadius="xl"
                fontSize="sm"
                color="gray.900"
              >
                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </NativeSelectField>
            </NativeSelectRoot>
          </Box>

          {/* Category */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="widest" px={1}>
              Category
            </Text>
            <NativeSelectRoot>
              <NativeSelectField
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                h={12}
                px={4}
                bg="white"
                borderColor="gray.200"
                borderRadius="xl"
                fontSize="sm"
                color="gray.900"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </NativeSelectField>
            </NativeSelectRoot>
          </Box>

          {/* Actions */}
          <Flex direction="column" gap={3} mt={2}>
            <Button
              onClick={saveTransaction}
              disabled={isSaving}
              loading={isSaving}
              loadingText="Saving..."
              h={12}
              borderRadius="xl"
              fontWeight="bold"
              colorPalette="brand"
            >
              Save transaction
            </Button>
            <Button
              onClick={() => router.back()}
              disabled={isSaving}
              h={12}
              borderRadius="xl"
              variant="outline"
              borderColor="gray.300"
              color="gray.700"
              fontSize="sm"
              fontWeight="semibold"
              _hover={{ bg: 'gray.50' }}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </Flex>
    );
  }

  return null;
}
