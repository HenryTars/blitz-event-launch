import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return NextResponse.json({ error: 'Quantity must be a whole number between 1 and 50.' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        event: {
          include: { books: { take: 1 } }
        },
        preorder: true
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    if (invitation.status === 'DECLINED') {
      return NextResponse.json({ error: 'Preorder is unavailable for declined invitations.' }, { status: 400 });
    }

    const firstBook = invitation.event.books[0];
    if (!firstBook) {
      return NextResponse.json({ error: 'No featured book available for preorder.' }, { status: 400 });
    }

    const previousQuantity = invitation.preorder?.quantity ?? 0;
    const quantityDelta = quantity - previousQuantity;

    const preorder = await prisma.$transaction(async (tx) => {
      const updatedPreorder = await tx.preorder.upsert({
        where: { invitationId: invitation.id },
        update: {
          quantity
        },
        create: {
          invitationId: invitation.id,
          bookId: firstBook.id,
          quantity
        }
      });

      if (quantityDelta !== 0) {
        await tx.eventAnalytics.upsert({
          where: { eventId: invitation.eventId },
          update: {
            preorderCount: {
              increment: quantityDelta
            }
          },
          create: {
            eventId: invitation.eventId,
            totalInvites: 0,
            acceptedCount: 0,
            declinedCount: 0,
            preorderCount: quantity,
            attendanceCount: 0
          }
        });
      }

      return updatedPreorder;
    });

    return NextResponse.json({
      quantity: preorder.quantity,
      message: previousQuantity ? 'Preorder updated.' : 'Preorder placed.'
    });
  } catch (error) {
    console.error('Preorder error:', error);
    return NextResponse.json({ error: 'Failed to process preorder.' }, { status: 500 });
  }
}
