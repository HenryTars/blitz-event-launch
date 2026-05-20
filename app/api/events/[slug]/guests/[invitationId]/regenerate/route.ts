import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest, isAdmin, isEventOwner } from '@/lib/rbac';

const createToken = (eventId: string, guestName: string) => {
  const raw = `${eventId}|${guestName}|${Date.now()}|${crypto.randomUUID()}`;
  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; invitationId: string }> }
) {
  try {
    const { slug, invitationId } = await params;

    const event = await prisma.event.findUnique({
      where: { slug }
    });
    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser || (!isAdmin(currentUser) && !isEventOwner(event, currentUser))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        eventId: event.id
      }
    });
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        token: createToken(event.id, invitation.guestName),
        status: 'PENDING',
        rsvpAt: null
      }
    });

    return NextResponse.json({ token: updated.token });
  } catch (error) {
    console.error('Failed to regenerate invitation:', error);
    return NextResponse.json({ error: 'Failed to regenerate invitation.' }, { status: 500 });
  }
}
