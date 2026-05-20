import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest, isAdmin, isEventOwner } from '@/lib/rbac';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { event: { select: { authorId: true, slug: true, title: true } } }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser || (!isAdmin(currentUser) && !isEventOwner(invitation.event, currentUser))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!invitation.isApproved === false) {
      return NextResponse.json({ message: 'Already rejected.' });
    }

    await prisma.invitation.update({
      where: { id },
      data: {
        isApproved: false,
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
        reviewNotes: reason || null
      }
    });

    // Notify the invited guest
    if (invitation.email) {
      const guestUser = await prisma.user.findUnique({ where: { email: invitation.email } });
      if (guestUser) {
        await createNotification({
          userId: guestUser.id,
          type: 'rejection',
          title: 'Invitation Declined',
          message: reason
            ? `Your invitation to ${invitation.event.title} was declined: ${reason}`
            : `Your invitation to ${invitation.event.title} was declined.`,
          link: `/invite/${invitation.token}`
        });
      }
    }

    return NextResponse.json({ message: 'Invitation rejected.' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    return NextResponse.json({ error: 'Failed to reject invitation.' }, { status: 500 });
  }
}
