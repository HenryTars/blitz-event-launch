import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createDbClient } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ user: null });

    let email: string | undefined;
    let userName: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      email = data.user?.email?.toLowerCase();
      userName = data.user?.user_metadata?.name || data.user?.user_metadata?.full_name;
    } else {
      const { data } = await supabase.auth.getUser();
      email = data.user?.email?.toLowerCase();
      userName = data.user?.user_metadata?.name || data.user?.user_metadata?.full_name;
    }

    if (!email) return NextResponse.json({ user: null });

    const client = createDbClient();
    try {
      await client.connect();

      // Fast path: existing user
      let result = await client.query(
        `SELECT id, email, name, role FROM "User" WHERE email = $1 LIMIT 1`,
        [email]
      );

      if (result.rows.length === 0) {
        // Provision DB user on first login
        const name = userName || email.split('@')[0];
        result = await client.query(
          `INSERT INTO "User" (id, email, name, role)
           VALUES (gen_random_uuid()::text, $1, $2, 'USER')
           ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
           RETURNING id, email, name, role`,
          [email, name]
        );
      }

      return NextResponse.json({ user: result.rows[0] ?? null });
    } finally {
      await client.end().catch(() => {});
    }
  } catch {
    return NextResponse.json({ user: null });
  }
}
