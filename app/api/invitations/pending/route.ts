import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest, isAdmin, isEventOwner } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventSlug = searchParams.get('eventSlug');

    if (!eventSlug) {
      return NextResponse.json({ error: 'eventSlug is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser || (!isAdmin(currentUser) && !isEventOwner(event, currentUser))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pending = await prisma.invitation.findMany({
      where: { eventId: event.id, isApproved: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        guestName: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });

    return NextResponse.json({ pending });
  } catch (error) {
    console.error('Pending invitations error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending invitations.' }, { status: 500 });
  }
}
