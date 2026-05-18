import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalOrganizers,
    totalAdmins,
    totalEvents,
    publishedCount,
    pendingCount,
    draftCount,
    rejectedCount,
    archivedCount,
    totalInvitations,
    totalCheckIns,
    recentUsers,
    recentEvents,
    recentLogs,
    eventsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ORGANIZER' } }),
    prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
    prisma.event.count(),
    prisma.event.count({ where: { status: 'PUBLISHED', deleted: false } }),
    prisma.event.count({ where: { status: 'PENDING_APPROVAL', deleted: false } }),
    prisma.event.count({ where: { status: 'DRAFT', deleted: false } }),
    prisma.event.count({ where: { status: 'REJECTED', deleted: false } }),
    prisma.event.count({ where: { status: 'ARCHIVED', deleted: false } }),
    prisma.invitation.count(),
    prisma.checkIn.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.event.findMany({ where: { deleted: false }, orderBy: { createdAt: 'desc' }, take: 10, include: { author: { select: { name: true, email: true } } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true, email: true } } } }),
    prisma.event.groupBy({ by: ['createdAt'], _count: true, orderBy: { createdAt: 'desc' }, take: 30 }),
  ]);

  const eventsByStatus = {
    published: publishedCount,
    pending: pendingCount,
    draft: draftCount,
    rejected: rejectedCount,
    archived: archivedCount,
    total: totalEvents,
  };

  return (
    <AdminDashboardClient
      stats={{
        totalUsers,
        totalOrganizers,
        totalAdmins,
        totalEvents,
        totalInvitations,
        totalCheckIns,
        eventsByStatus,
        eventsByDay: eventsByDay.map(e => ({ date: e.createdAt.toISOString().split('T')[0], count: e._count })),
      }}
      recentUsers={recentUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt.toISOString() }))}
      recentEvents={recentEvents.map(e => ({ id: e.id, title: e.title, slug: e.slug, author: e.author, createdAt: e.createdAt.toISOString() }))}
      recentLogs={recentLogs.map(l => ({ id: l.id, action: l.action, entity: l.entity, user: l.user, createdAt: l.createdAt.toISOString() }))}
    />
  );
}
