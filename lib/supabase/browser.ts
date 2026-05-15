import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.warn(
        'Supabase env vars missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set on Vercel and redeploy.',
        { url: !!url, anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, pubKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }
      );
    }
    return null;
  }

  return createBrowserClient(url, key);
}
