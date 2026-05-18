import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuthenticatedUser();
  if (!auth.user) return auth.errorResponse!;

  const slug = (await params).slug;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.authorId !== auth.user.id && auth.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (event.deleted) {
    return NextResponse.json({ error: 'Already deleted' }, { status: 410 });
  }

  // Soft delete
  await prisma.event.update({
    where: { id: event.id },
    data: { deleted: true, deletedAt: new Date(), status: 'ARCHIVED' },
  });

  await createAuditLog({
    action: 'event.deleted',
    entity: 'Event',
    entityId: event.id,
    description: `Soft-deleted event: ${event.title}`,
    userId: auth.user.id,
  });

  return NextResponse.json({ success: true, message: 'Event deleted' });
}
