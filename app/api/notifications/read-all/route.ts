import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/rbac';

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.notification.updateMany({
      where: { userId: currentUser.id, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read.' }, { status: 500 });
  }
}
