import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ user: null });
    }

    let supabaseUser: User | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      supabaseUser = data.user;
    } else {
      const { data } = await supabase.auth.getUser();
      supabaseUser = data.user;
    }

    const email = supabaseUser?.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ user: null });
    }

    // Upsert: create the DB user on first call if they signed up via Supabase
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name:
          supabaseUser?.user_metadata?.name ||
          supabaseUser?.user_metadata?.full_name ||
          email.split('@')[0],
        role: 'USER'
      },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({ user: dbUser });
  } catch {
    return NextResponse.json({ user: null });
  }
}
