import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid check-in token' }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: invitation.eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (invitation.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Guest must accept the invitation before check-in' }, { status: 400 });
    }

    // Check if already checked in
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        invitationId: invitation.id
      }
    });

    if (existingCheckIn) {
      return NextResponse.json({
        message: 'Already checked in',
        guestName: invitation.guestName,
        checkedInAt: existingCheckIn.scannedAt,
        eventTitle: event.title
      });
    }

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        invitationId: invitation.id
      }
    });

    // Update analytics
    await prisma.eventAnalytics.update({
      where: { eventId: event.id },
      data: { attendanceCount: { increment: 1 } }
    });

    return NextResponse.json({
      message: 'Check-in successful',
      guestName: invitation.guestName,
      checkedInAt: checkIn.scannedAt,
      eventTitle: event.title
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({
      error: 'Failed to process check-in'
    }, { status: 500 });
  }
}
