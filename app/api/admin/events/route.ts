import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

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
  if (status === 'published') where.published = true;
  if (status === 'draft') where.published = false;

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

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) return auth.errorResponse!;

  const body = await request.json();
  const { eventId, action, reason } = body;

  if (!eventId || !action) {
    return NextResponse.json({ error: 'eventId and action required' }, { status: 400 });
  }

  const target = await prisma.event.findUnique({ where: { id: eventId } });
  if (!target) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  switch (action) {
    case 'publish': {
      await prisma.event.update({ where: { id: eventId }, data: { published: true } });
      await createAuditLog({ action: 'event.published', entity: 'Event', entityId: eventId, description: `Published ${target.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true });
    }
    case 'unpublish': {
      await prisma.event.update({ where: { id: eventId }, data: { published: false } });
      await createAuditLog({ action: 'event.unpublished', entity: 'Event', entityId: eventId, description: `Unpublished ${target.title}`, userId: auth.user.id, metadata: { reason } });
      return NextResponse.json({ success: true });
    }
    case 'feature': {
      await prisma.event.update({ where: { id: eventId }, data: { featured: true } });
      await createAuditLog({ action: 'event.featured', entity: 'Event', entityId: eventId, description: `Featured ${target.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true });
    }
    case 'unfeature': {
      await prisma.event.update({ where: { id: eventId }, data: { featured: false } });
      await createAuditLog({ action: 'event.unfeatured', entity: 'Event', entityId: eventId, description: `Unfeatured ${target.title}`, userId: auth.user.id });
      return NextResponse.json({ success: true });
    }
    case 'delete': {
      await prisma.event.update({ where: { id: eventId }, data: { deleted: true, deletedAt: new Date() } });
      await createAuditLog({ action: 'event.deleted', entity: 'Event', entityId: eventId, description: `Soft-deleted ${target.title}`, userId: auth.user.id, metadata: { reason } });
      return NextResponse.json({ success: true, message: 'Event hidden from public' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
