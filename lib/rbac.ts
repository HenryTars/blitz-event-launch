import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { queryUser } from '@/lib/db';

export type { UserRole };

export async function getCurrentUser(authToken?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  let email: string | undefined;
  if (authToken) {
    const { data } = await supabase.auth.getUser(authToken);
    email = data.user?.email?.toLowerCase();
  } else {
    const { data } = await supabase.auth.getUser();
    email = data.user?.email?.toLowerCase();
  }

  if (!email) return null;

  const dbUser = await queryUser(email);
  if (!dbUser) return null;

  return { ...dbUser, authId: '' };
}

export async function getCurrentUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  return getCurrentUser(token);
}

export function hasRole(user: { role: string } | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

export function isAdmin(user: { role: string } | null): boolean {
  return hasRole(user, 'SUPER_ADMIN');
}

export function isOrganizer(user: { role: string } | null): boolean {
  return hasRole(user, 'ORGANIZER', 'SUPER_ADMIN');
}

export async function requireRole(reqOrToken: NextRequest | string | undefined, ...roles: UserRole[]) {
  const user = typeof reqOrToken === 'string'
    ? await getCurrentUser(reqOrToken)
    : reqOrToken instanceof Request
      ? await getCurrentUserFromRequest(reqOrToken as NextRequest)
      : await getCurrentUser();
  if (!user) {
    return {
      user: null as null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }
  if (!roles.includes(user.role as UserRole)) {
    return {
      user: null as null,
      errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    };
  }
  return { user, errorResponse: null as null };
}

export async function requireAdmin(reqOrToken?: NextRequest | string) {
  return requireRole(reqOrToken, 'SUPER_ADMIN');
}

export async function requireOrganizer(reqOrToken?: NextRequest | string) {
  return requireRole(reqOrToken, 'ORGANIZER', 'SUPER_ADMIN');
}

export function isEventOwner(event: { authorId: string }, user: { id: string } | null): boolean {
  if (!user) return false;
  return event.authorId === user.id;
}

export function canModifyEvent(event: { authorId: string }, user: { id: string; role: string } | null): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return event.authorId === user.id;
}
