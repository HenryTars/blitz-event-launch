import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { createInvitationSchema } from '@/lib/validation/invitation';

const createToken = (eventId: string, guestName: string) => {
  const raw = `${eventId}|${guestName}|${Date.now()}|${crypto.randomUUID()}`;
  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createInvitationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please review invitation details.',
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { eventId, guestName, email, phone } = parsed.data;
    const normalizedEmail = email?.toLowerCase();

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    if (normalizedEmail) {
      const existingByEmail = await prisma.invitation.findFirst({
        where: {
          eventId,
          email: {
            equals: normalizedEmail
          }
        }
      });

      if (existingByEmail) {
        return NextResponse.json({
          token: existingByEmail.token,
          guestName: existingByEmail.guestName,
          email: existingByEmail.email,
          duplicated: true
        });
      }
    }

    const token = createToken(eventId, guestName);

    const invitation = await prisma.$transaction(async (tx) => {
      const createdInvitation = await tx.invitation.create({
        data: {
          eventId,
          guestName,
          email: normalizedEmail ?? '',
          phone: phone ?? '',
          token
        }
      });

      await tx.eventAnalytics.upsert({
        where: { eventId },
        update: {
          totalInvites: {
            increment: 1
          }
        },
        create: {
          eventId,
          totalInvites: 1,
          acceptedCount: 0,
          declinedCount: 0,
          preorderCount: 0,
          attendanceCount: 0
        }
      });

      return createdInvitation;
    });

    return NextResponse.json({
      token: invitation.token,
      guestName: invitation.guestName,
      email: invitation.email,
      duplicated: false
    });
  } catch (error) {
    console.error('Invitation creation error:', error);
    return NextResponse.json({ error: 'Failed to create invitation.' }, { status: 500 });
  }
}
