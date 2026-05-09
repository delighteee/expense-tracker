import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/onboarding', '/upload', '/settings'];
const authRoutes = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*).*)'],
};
