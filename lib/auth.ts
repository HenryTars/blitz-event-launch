import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isSuspended: boolean;
  avatarUrl: string | null;
  dbUser: any;
  authId: string;
}

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      user: null as AuthUser | null,
      errorResponse: NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    };
  }
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }

  const email = data.user.email.toLowerCase();

  try {
    let dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'USER'
        }
      });
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      isSuspended: dbUser.isSuspended,
      avatarUrl: dbUser.avatarUrl,
      dbUser: dbUser,
      authId: data.user.id
    };

    if (authUser.isSuspended) {
      return {
        user: null,
        errorResponse: NextResponse.json({ error: 'Account suspended' }, { status: 403 })
      };
    }

    return {
      user: authUser,
      errorResponse: null
    };
  } catch (error) {
    console.error('Database error in requireAuthenticatedUser:', error);
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Database connection failed.' },
        { status: 503 }
      )
    };
  }
}
