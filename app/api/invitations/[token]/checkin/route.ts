import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { token }
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  }

  if (invitation.status !== 'ACCEPTED') {
    return NextResponse.json({ error: 'Guest has not accepted yet.' }, { status: 400 });
  }

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: { invitationId: invitation.id }
  });

  if (existingCheckIn) {
    return NextResponse.json({ message: 'Guest already checked in.', checkedInAt: existingCheckIn.scannedAt });
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      invitationId: invitation.id
    }
  });

  await prisma.eventAnalytics.update({
    where: { eventId: invitation.eventId },
    data: {
      attendanceCount: {
        increment: 1
      }
    }
  });

  return NextResponse.json({ checkedInAt: checkIn.scannedAt });
}
