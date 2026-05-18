import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    // Use Authorization header token if available (more reliable than cookies in API routes)
    const authHeader = req.headers.get('authorization');
    let email: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser(token);
        email = data.user?.email?.toLowerCase();
      }
    } else {
      const supabase = await createSupabaseServerClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
      }
      const { data } = await supabase.auth.getUser();
      email = data.user?.email?.toLowerCase();
    }

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ organizer: { email }, events: [] });
    }

    const events = await prisma.event.findMany({
      where: { authorId: user.id },
      include: {
        books: true,
        analytics: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      slug: event.slug,
      venue: event.venue,
      startAt: event.startAt,
      endAt: event.endAt,
      heroImageUrl: event.heroImageUrl,
      theme: event.theme,
      status: event.status,
      featured: event.featured,
      createdAt: event.createdAt,
      book: event.books.length > 0 ? {
        title: event.books[0].title,
        author: event.books[0].author,
        coverUrl: event.books[0].coverUrl,
        description: event.books[0].description
      } : null,
      analytics: event.analytics ? {
        totalInvites: event.analytics.totalInvites,
        acceptedCount: event.analytics.acceptedCount,
        declinedCount: event.analytics.declinedCount,
        preorderCount: event.analytics.preorderCount,
        attendanceCount: event.analytics.attendanceCount
      } : null
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organizer: {
        email: user.email,
        name: user.name
      },
      events: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    return NextResponse.json({ error: 'Failed to fetch organizer events.' }, { status: 500 });
  }
}
