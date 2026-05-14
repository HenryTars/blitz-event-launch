import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        books: true,
        analytics: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      venue: event.venue,
      startAt: event.startAt,
      endAt: event.endAt,
      books: event.books,
      analytics: event.analytics
        ? {
            totalInvites: event.analytics.totalInvites,
            acceptedCount: event.analytics.acceptedCount,
            declinedCount: event.analytics.declinedCount,
            preorderCount: event.analytics.preorderCount,
            attendanceCount: event.analytics.attendanceCount
          }
        : null
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({
      error: 'Failed to fetch event'
    }, { status: 500 });
  }
}
