import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If missing env vars and accessing admin, redirect to auth
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });
    const { data: { user } } = await supabase.auth.getUser();

    // Admin routes: redirect to auth if not authenticated
    if (pathname.startsWith('/admin') && !user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  } catch {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
