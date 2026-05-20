import { NextRequest, NextResponse } from 'next/server';
import type { Invitation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest, isAdmin, isEventOwner } from '@/lib/rbac';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser || (!isAdmin(currentUser) && !isEventOwner(event, currentUser))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(
      invitations.map((inv: Invitation) => ({
        id: inv.id,
        guestName: inv.guestName,
        guestEmail: inv.email,
        token: inv.token,
        status: inv.status,
        isApproved: inv.isApproved,
        createdAt: inv.createdAt
      }))
    );
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({
      error: 'Failed to fetch guest list'
    }, { status: 500 });
  }
}
