import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin, isEventOwner } from '@/lib/rbac';

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

    const currentUser = await getCurrentUser();
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

    return NextResponse.json({ message: 'Invitation rejected.' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    return NextResponse.json({ error: 'Failed to reject invitation.' }, { status: 500 });
  }
}
