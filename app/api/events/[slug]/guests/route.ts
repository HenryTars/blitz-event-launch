import { NextResponse } from 'next/server';
import type { Invitation } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const invitations = await prisma.invitation.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(
      invitations.map((inv: Invitation) => ({
        id: inv.id,
        guestName: inv.guestName,
        guestEmail: inv.email,
        token: inv.token,
        status: inv.status,
        createdAt: inv.createdAt
      }))
    );
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({
      error: 'Failed to fetch guest list'
    }, { status: 500 });
  }
}
