import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ user: null });
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email.toLowerCase() },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: dbUser });
  } catch {
    return NextResponse.json({ user: null });
  }
}
