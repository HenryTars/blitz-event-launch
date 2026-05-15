import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';

export type { UserRole };

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email.toLowerCase() }
  });

  if (!dbUser) return null;

  return {
    ...dbUser,
    authId: user.id,
    email: user.email.toLowerCase()
  };
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

export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
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

export async function requireAdmin() {
  return requireRole('SUPER_ADMIN');
}

export async function requireOrganizer() {
  return requireRole('ORGANIZER', 'SUPER_ADMIN');
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
