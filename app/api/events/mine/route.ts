import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const auth = await requireAuthenticatedUser();
    if (!auth.user) return auth.errorResponse!;

    const organizerEmail = auth.user.email!.toLowerCase();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: organizerEmail }
    });

    if (!user) {
      return NextResponse.json({
        organizer: {
          email: organizerEmail,
          name: 'Unknown User'
        },
        events: []
      });
    }

    // Get events with books and analytics
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
