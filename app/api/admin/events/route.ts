import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const where: any = { deleted: false };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { author: { email: { contains: query, mode: 'insensitive' } } },
    ];
  }
  if (['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'ARCHIVED'].includes(status)) {
    where.status = status;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true, email: true } },
        analytics: true,
        _count: { select: { invitations: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}

const validStatusTransitions: Record<string, string[]> = {
  DRAFT: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  REJECTED: ['DRAFT', 'PENDING_APPROVAL'],
  ARCHIVED: ['DRAFT'],
};

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) return auth.errorResponse!;

  const body = await request.json();
  const { eventId, action, reason, status: targetStatus } = body;

  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Handle status transitions
  if (targetStatus) {
    const allowed = validStatusTransitions[event.status] || [];
    if (!allowed.includes(targetStatus)) {
      return NextResponse.json({
        error: `Cannot transition from ${event.status} to ${targetStatus}. Allowed: ${allowed.join(', ') || 'none'}`
      }, { status: 400 });
    }

    const updateData: any = { status: targetStatus };
    if (targetStatus === 'PUBLISHED') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = auth.user.id;
    }
    if (targetStatus === 'REJECTED') {
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = auth.user.id;
      updateData.rejectionReason = reason || null;
    }

    await prisma.event.update({ where: { id: eventId }, data: updateData });
    await createAuditLog({
      action: `event.${targetStatus.toLowerCase()}`,
      entity: 'Event',
      entityId: eventId,
      description: `Event "${event.title}" ${targetStatus.toLowerCase()}${reason ? `: ${reason}` : ''}`,
      userId: auth.user.id,
      metadata: { previousStatus: event.status, newStatus: targetStatus, reason },
    });

    // Notify event owner
    if (targetStatus === 'PUBLISHED') {
      await createNotification({
        userId: event.authorId,
        type: 'approval',
        title: 'Event Approved',
        message: `Your event "${event.title}" has been approved and is now live.`,
        link: `/events/${event.slug}/dashboard`
      });
    } else if (targetStatus === 'REJECTED') {
      await createNotification({
        userId: event.authorId,
        type: 'rejection',
        title: 'Event Not Approved',
        message: reason
          ? `Your event "${event.title}" was not approved: ${reason}`
          : `Your event "${event.title}" was not approved.`,
        link: `/events/${event.slug}/edit`
      });
    }

    return NextResponse.json({ success: true, status: targetStatus, message: `Event ${targetStatus.toLowerCase()}` });
  }

  // Legacy actions (publish/unpublish/feature/unfeature/delete)
  switch (action) {
    case 'publish': {
      await prisma.event.update({ where: { id: eventId }, data: { status: 'PUBLISHED', approvedAt: new Date(), approvedBy: auth.user.id } });
      await createAuditLog({ action: 'event.published', entity: 'Event', entityId: eventId, description: `Published ${event.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true, status: 'PUBLISHED' });
    }
    case 'unpublish': {
      await prisma.event.update({ where: { id: eventId }, data: { status: 'DRAFT' } });
      await createAuditLog({ action: 'event.unpublished', entity: 'Event', entityId: eventId, description: `Unpublished ${event.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true, status: 'DRAFT' });
    }
    case 'feature': {
      await prisma.event.update({ where: { id: eventId }, data: { featured: true } });
      await createAuditLog({ action: 'event.featured', entity: 'Event', entityId: eventId, description: `Featured ${event.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true });
    }
    case 'unfeature': {
      await prisma.event.update({ where: { id: eventId }, data: { featured: false } });
      await createAuditLog({ action: 'event.unfeatured', entity: 'Event', entityId: eventId, description: `Unfeatured ${event.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true });
    }
    case 'delete': {
      await prisma.event.update({ where: { id: eventId }, data: { deleted: true, deletedAt: new Date(), status: 'ARCHIVED' } });
      await createAuditLog({ action: 'event.deleted', entity: 'Event', entityId: eventId, description: `Soft-deleted ${event.title}`, userId: auth.user.id, metadata: { reason } });
      return NextResponse.json({ success: true, message: 'Event archived' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
