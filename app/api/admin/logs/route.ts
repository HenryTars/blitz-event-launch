import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.user) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || '';
  const entity = searchParams.get('entity') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const where: any = {};
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (entity) where.entity = entity;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}
