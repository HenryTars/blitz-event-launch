import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin, isEventOwner } from '@/lib/rbac';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { event: { select: { authorId: true, slug: true, title: true } } }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || (!isAdmin(currentUser) && !isEventOwner(invitation.event, currentUser))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (invitation.isApproved) {
      return NextResponse.json({ message: 'Already approved.' });
    }

    await prisma.invitation.update({
      where: { id },
      data: {
        isApproved: true,
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
        reviewNotes: null
      }
    });

    // Notify the invited guest
    if (invitation.email) {
      const guestUser = await prisma.user.findUnique({ where: { email: invitation.email } });
      if (guestUser) {
        await createNotification({
          userId: guestUser.id,
          type: 'approval',
          title: 'Invitation Approved',
          message: `Your invitation to ${invitation.event.title} has been approved. You can now RSVP.`,
          link: `/invite/${invitation.token}`
        });
      }
    }

    return NextResponse.json({ message: 'Invitation approved.' });
  } catch (error) {
    console.error('Approve invitation error:', error);
    return NextResponse.json({ error: 'Failed to approve invitation.' }, { status: 500 });
  }
}
