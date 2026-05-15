import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isShortCodeExpired } from '@/lib/shortcode';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const trimmed = token.trim().toUpperCase();

    // Look up by shortCode first (6 chars, uppercase), fallback to full token
    const invitation = trimmed.length === 6
      ? await prisma.invitation.findUnique({ where: { shortCode: trimmed }, include: { event: true } })
      : await prisma.invitation.findUnique({ where: { token }, include: { event: true } });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid code. No invitation found.' }, { status: 404 });
    }

    // Expiration check
    if (isShortCodeExpired(invitation.event.endAt, invitation.event.startAt)) {
      return NextResponse.json({ error: 'This event has already ended.' }, { status: 400 });
    }

    if (invitation.status !== 'ACCEPTED') {
      return NextResponse.json(
        {
          error: `Guest has not accepted. Current status: ${invitation.status}`,
          guestName: invitation.guestName,
          shortCode: invitation.shortCode
        },
        { status: 400 }
      );
    }

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: { invitationId: invitation.id }
    });

    if (existingCheckIn) {
      return NextResponse.json({
        message: `${invitation.guestName} was already checked in.`,
        guestName: invitation.guestName,
        shortCode: invitation.shortCode,
        checkedInAt: existingCheckIn.scannedAt,
        eventTitle: invitation.event.title,
        eventSlug: invitation.event.slug,
        alreadyCheckedIn: true
      });
    }

    const checkIn = await prisma.checkIn.create({
      data: { invitationId: invitation.id }
    });

    await prisma.eventAnalytics.update({
      where: { eventId: invitation.event.id },
      data: { attendanceCount: { increment: 1 } }
    });

    return NextResponse.json({
      message: `Welcome, ${invitation.guestName}!`,
      guestName: invitation.guestName,
      shortCode: invitation.shortCode,
      checkedInAt: checkIn.scannedAt,
      eventTitle: invitation.event.title,
      eventSlug: invitation.event.slug,
      alreadyCheckedIn: false
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to process check-in.' }, { status: 500 });
  }
}
