import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

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

const EMPTY_RESULT = {
  amount: '',
  date: '',
  narration: '',
  bank: 'Other',
  category: 'Other',
  direction: 'debit' as const,
};

export async function POST(req: NextRequest) {
  const res = NextResponse.next();

  // Authenticate via session cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();

  // Upload to Supabase Storage using service role (bypasses RLS)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${session.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from('receipts')
    .upload(storagePath, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('[parse-receipt] Storage upload error:', uploadError.message);
  }

  const imageRef = uploadError ? null : storagePath;

  // PDFs: skip AI vision, return empty fields for manual entry
  if (file.type === 'application/pdf') {
    return NextResponse.json({ ...EMPTY_RESULT, image_ref: imageRef });
  }

  // Call Anthropic Messages API with vision
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mediaType = (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ? file.type
    : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';

  let parsed: { amount: string; date: string; narration: string; bank: string; category: string; direction: 'debit' | 'credit' } = { ...EMPTY_RESULT };

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `You are a Nigerian bank receipt/alert parser. Extract details from this image and return ONLY valid JSON — no markdown, no explanation, no code fences.

Required JSON shape:
{
  "amount": "<transaction amount as numeric string, no currency symbol, e.g. 5000.00>",
  "date": "<transaction date as YYYY-MM-DD>",
  "narration": "<brief transaction description or purpose>",
  "bank": "<exactly one of: ${BANKS.join(' | ')}>",
  "category": "<exactly one of: ${CATEGORIES.join(' | ')}>",
  "direction": "<debit or credit>"
}

Rules:
- Use "" for amount/date/narration if not found
- Use "Other" for bank/category if not clearly identified
- Use "debit" for direction if unclear
- Infer category from narration/merchant (e.g. Chicken Republic → Food & Drinks, Uber → Transport, DSTV → Subscriptions)`,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      console.error('[parse-receipt] Anthropic error:', anthropicRes.status, await anthropicRes.text());
    } else {
      const aiData = await anthropicRes.json();
      const rawText: string = aiData.content?.[0]?.text ?? '';

      // Strip any accidental markdown fences
      const jsonText = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      const json = JSON.parse(jsonText);

      parsed = {
        amount: String(json.amount ?? ''),
        date: String(json.date ?? ''),
        narration: String(json.narration ?? ''),
        bank: BANKS.includes(json.bank) ? json.bank : 'Other',
        category: CATEGORIES.includes(json.category) ? json.category : 'Other',
        direction: (json.direction === 'credit' ? 'credit' : 'debit') as 'debit' | 'credit',
      };
    }
  } catch (err) {
    console.error('[parse-receipt] AI parse error:', err);
    // Return empty fields — user fills manually
  }

  return NextResponse.json({ ...parsed, image_ref: imageRef });
}
