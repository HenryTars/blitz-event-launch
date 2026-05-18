import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export async function authHeaders(): Promise<HeadersInit> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return {};
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = { ...options.headers, ...(await authHeaders()) };
  return fetch(url, { ...options, headers });
}
