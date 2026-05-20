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

    // Fast path: user already exists (most calls)
    let dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true }
    });

    // Slow path: new Supabase signup — provision DB record once
    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            email,
            name:
              supabaseUser?.user_metadata?.name ||
              supabaseUser?.user_metadata?.full_name ||
              email.split('@')[0],
            role: 'USER'
          },
          select: { id: true, email: true, name: true, role: true }
        });
      } catch {
        // Race condition: another concurrent request already created it
        dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true }
        });
      }
    }

    return NextResponse.json({ user: dbUser });
  } catch {
    return NextResponse.json({ user: null });
  }
}
