import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getInviteLink } from '@/lib/url';
import { generateShortCode } from '@/lib/shortcode';
import { getCurrentUserFromRequest, isAdmin, isEventOwner } from '@/lib/rbac';

function createToken(eventId: string, guestName: string) {
  const raw = `${eventId}|${guestName}|${Date.now()}|${crypto.randomUUID()}`;
  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventSlug, guestName, email, phone } = body;

    if (!eventSlug || !guestName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: eventSlug, guestName, email' },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug: eventSlug }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.invitation.findFirst({
      where: { eventId: event.id, email: normalizedEmail }
    });

    if (existing) {
      return NextResponse.json({
        token: existing.token,
        shortCode: existing.shortCode,
        guestName: existing.guestName,
        inviteLink: getInviteLink(existing.token),
        duplicated: true,
        isApproved: existing.isApproved
      });
    }

    // Auto-approve if the requester is the event owner or an admin
    const currentUser = await getCurrentUserFromRequest(req);
    const shouldAutoApprove = !!(currentUser && (isAdmin(currentUser) || isEventOwner(event, currentUser)));

    const token = createToken(event.id, guestName);
    let shortCode = generateShortCode();

    let attempts = 0;
    while (await prisma.invitation.findUnique({ where: { shortCode } })) {
      shortCode = generateShortCode();
      attempts++;
      if (attempts > 10) break;
    }

    const invitation = await prisma.$transaction(async (tx) => {
      const created = await tx.invitation.create({
        data: {
          eventId: event.id,
          guestName,
          email: normalizedEmail,
          phone: phone ?? '',
          token,
          shortCode,
          isApproved: shouldAutoApprove,
          reviewedAt: shouldAutoApprove ? new Date() : null,
          reviewedBy: shouldAutoApprove ? currentUser!.id : null
        }
      });

      await tx.eventAnalytics.upsert({
        where: { eventId: event.id },
        update: { totalInvites: { increment: 1 } },
        create: {
          eventId: event.id,
          totalInvites: 1,
          acceptedCount: 0,
          declinedCount: 0,
          preorderCount: 0,
          attendanceCount: 0
        }
      });

      return created;
    });

    return NextResponse.json({
      token: invitation.token,
      shortCode: invitation.shortCode,
      guestName: invitation.guestName,
      inviteLink: getInviteLink(invitation.token),
      isApproved: invitation.isApproved,
      duplicated: false
    });
  } catch (error) {
    console.error('Invitation request error:', error);
    return NextResponse.json({ error: 'Failed to request invitation.' }, { status: 500 });
  }
}
