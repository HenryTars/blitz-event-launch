import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rsvpStatusSchema } from '@/lib/validation/invitation';
import { createNotificationForEventOwner } from '@/lib/notifications';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      event: {
        include: {
          books: true,
          analytics: true
        }
      },
      preorder: true
    }
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  }

  return NextResponse.json({ invitation });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const parsedStatus = rsvpStatusSchema.safeParse(String(body.status ?? '').toUpperCase());

  if (!parsedStatus.success) {
    return NextResponse.json({ error: 'Invalid RSVP status.' }, { status: 400 });
  }

  const status = parsedStatus.data;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { event: { select: { id: true, slug: true, title: true } } }
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  }

  if (invitation.status !== 'PENDING') {
    return NextResponse.json({ error: 'RSVP already submitted.' }, { status: 400 });
  }

  const analyticsUpdate: Record<string, unknown> = {};
  if (status === 'ACCEPTED') {
    analyticsUpdate.acceptedCount = { increment: 1 };
  }
  if (status === 'DECLINED') {
    analyticsUpdate.declinedCount = { increment: 1 };
  }

  const updatedInvitation = await prisma.$transaction(async (tx) => {
    const updated = await tx.invitation.update({
      where: { token },
      data: {
        status,
        rsvpAt: new Date()
      }
    });

    await tx.eventAnalytics.upsert({
      where: { eventId: invitation.eventId },
      update: analyticsUpdate,
      create: {
        eventId: invitation.eventId,
        totalInvites: 0,
        acceptedCount: status === 'ACCEPTED' ? 1 : 0,
        declinedCount: status === 'DECLINED' ? 1 : 0,
        preorderCount: 0,
        attendanceCount: 0
      }
    });

    return updated;
  });

  // Notify the event owner
  const statusLabel = status === 'ACCEPTED' ? 'accepted' : status === 'DECLINED' ? 'declined' : 'maybe';
  await createNotificationForEventOwner(invitation.eventId, {
    type: 'rsvp',
    title: `${invitation.guestName} ${statusLabel} your invitation`,
    message: `${invitation.guestName} has ${statusLabel} the invitation to ${invitation.event.title}.`,
    link: `/events/${invitation.event.slug}/dashboard`
  });

  return NextResponse.json({ status: updatedInvitation.status });
}
