import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.user) return auth.errorResponse!;

  const [usersByRole, eventsByStatus, invitationsByStatus, totalCheckIns, recentSignups] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.event.groupBy({ by: ['status', 'deleted'], _count: true }),
    prisma.invitation.groupBy({ by: ['status'], _count: true }),
    prisma.checkIn.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  return NextResponse.json({
    usersByRole,
    eventsByStatus,
    invitationsByStatus,
    totalCheckIns,
    recentSignups,
  });
}
