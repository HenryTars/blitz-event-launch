import { NextRequest, NextResponse } from 'next/server';
import { createDbClient } from '@/lib/db';
import { getCurrentUserFromRequest } from '@/lib/rbac';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(req);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createDbClient();

  try {
    await client.connect();

    const [notifResult, countResult] = await Promise.all([
      client.query(
        `SELECT id, type, title, message, link, "isRead", "createdAt"
         FROM "Notification"
         WHERE "userId" = $1
         ORDER BY "createdAt" DESC
         LIMIT 50`,
        [currentUser.id]
      ),
      client.query(
        `SELECT COUNT(*)::int AS count FROM "Notification"
         WHERE "userId" = $1 AND "isRead" = false`,
        [currentUser.id]
      )
    ]);

    return NextResponse.json({
      notifications: notifResult.rows,
      unreadCount: countResult.rows[0].count
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications.' }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, type, link, metadata } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    await createNotification({
      userId: body.userId,
      type,
      title,
      message,
      link,
      metadata
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification create error:', error);
    return NextResponse.json({ error: 'Failed to create notification.' }, { status: 500 });
  }
}
