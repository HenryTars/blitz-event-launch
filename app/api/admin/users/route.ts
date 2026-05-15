import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const where: any = {};
  if (query) {
    where.OR = [
      { email: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (role && ['USER', 'ORGANIZER', 'SUPER_ADMIN'].includes(role)) {
    where.role = role;
  }
  if (status === 'suspended') where.isSuspended = true;
  if (status === 'active') where.isSuspended = false;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        _count: { select: { events: true, invitations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) return auth.errorResponse!;

  const body = await request.json();
  const { userId, action, reason } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  switch (action) {
    case 'suspend': {
      await prisma.user.update({
        where: { id: userId },
        data: { isSuspended: true, suspendedAt: new Date(), suspendedBy: auth.user.id },
      });
      await createAuditLog({
        action: 'user.suspended',
        entity: 'User',
        entityId: userId,
        description: `Suspended ${target.email}`,
        userId: auth.user.id,
        metadata: { reason, suspendedBy: auth.user.email },
      });
      return NextResponse.json({ success: true, message: 'User suspended' });
    }
    case 'activate': {
      await prisma.user.update({
        where: { id: userId },
        data: { isSuspended: false, suspendedAt: null, suspendedBy: null },
      });
      await createAuditLog({
        action: 'user.activated',
        entity: 'User',
        entityId: userId,
        description: `Activated ${target.email}`,
        userId: auth.user.id,
      });
      return NextResponse.json({ success: true, message: 'User activated' });
    }
    case 'promote': {
      const newRole = body.role || 'ORGANIZER';
      if (!['ORGANIZER', 'SUPER_ADMIN'].includes(newRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      await createAuditLog({
        action: 'user.promoted',
        entity: 'User',
        entityId: userId,
        description: `Promoted ${target.email} to ${newRole}`,
        userId: auth.user.id,
        metadata: { newRole },
      });
      return NextResponse.json({ success: true, message: `User promoted to ${newRole}` });
    }
    case 'demote': {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'USER' },
      });
      await createAuditLog({
        action: 'user.demoted',
        entity: 'User',
        entityId: userId,
        description: `Demoted ${target.email} to USER`,
        userId: auth.user.id,
      });
      return NextResponse.json({ success: true, message: 'User demoted to USER' });
    }
    case 'delete': {
      await prisma.user.delete({ where: { id: userId } });
      await createAuditLog({
        action: 'user.deleted',
        entity: 'User',
        entityId: userId,
        description: `Deleted user ${target.email}`,
        userId: auth.user.id,
      });
      return NextResponse.json({ success: true, message: 'User deleted' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
