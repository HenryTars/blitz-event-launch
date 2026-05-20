import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest, isAdmin, isEventOwner } from '@/lib/rbac';

export async function DELETE(
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
      },
      include: {
        preorder: true,
        checkIns: true
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const checkInCount = invitation.checkIns.length;
    const preorderQuantity = invitation.preorder?.quantity ?? 0;

    await prisma.$transaction(async (tx) => {
      if (checkInCount > 0) {
        await tx.checkIn.deleteMany({
          where: { invitationId: invitation.id }
        });
      }

      if (invitation.preorder) {
        await tx.preorder.delete({
          where: { invitationId: invitation.id }
        });
      }

      await tx.invitation.delete({
        where: { id: invitation.id }
      });

      await tx.eventAnalytics.upsert({
        where: { eventId: event.id },
        update: {
          totalInvites: { decrement: 1 },
          acceptedCount: invitation.status === 'ACCEPTED' ? { decrement: 1 } : undefined,
          declinedCount: invitation.status === 'DECLINED' ? { decrement: 1 } : undefined,
          attendanceCount: checkInCount > 0 ? { decrement: checkInCount } : undefined,
          preorderCount: preorderQuantity > 0 ? { decrement: preorderQuantity } : undefined
        },
        create: {
          eventId: event.id,
          totalInvites: 0,
          acceptedCount: 0,
          declinedCount: 0,
          preorderCount: 0,
          attendanceCount: 0
        }
      });
    });

    return NextResponse.json({ message: 'Guest removed.' });
  } catch (error) {
    console.error('Failed to remove guest:', error);
    return NextResponse.json({ error: 'Failed to remove guest.' }, { status: 500 });
  }
}
