import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let email: string | undefined;

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ user: null });
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      email = data.user?.email?.toLowerCase();
    } else {
      const { data } = await supabase.auth.getUser();
      email = data.user?.email?.toLowerCase();
    }

    if (!email) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({ user: dbUser });
  } catch {
    return NextResponse.json({ user: null });
  }
}
