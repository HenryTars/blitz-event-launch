import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      user: null,
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

  // Ensure user exists in our database
  const email = data.user.email.toLowerCase();
  
  try {
    let dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      try {
        // Create user record if it doesn't exist
        dbUser = await prisma.user.create({
          data: {
            email,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || null
          }
        });
      } catch (createError: any) {
        // If creation fails (e.g., constraint), try to fetch again
        if (createError.code === 'P2002') {
          dbUser = await prisma.user.findUnique({
            where: { email }
          });
        } else {
          throw createError;
        }
      }
    }

    return {
      user: { ...data.user, dbUser },
      errorResponse: null
    };
  } catch (error) {
    console.error('Database error in requireAuthenticatedUser:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error:', errorMsg);
    return {
      user: null,
      errorResponse: NextResponse.json(
        { 
          error: 'Database connection failed. Please ensure tables are created.',
          details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
        },
        { status: 503 }
      )
    };
  }
}
