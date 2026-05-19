import { NextResponse } from 'next/server';
import { createEventSchema } from '@/lib/validation/event';
import { requireAuthenticatedUser } from '@/lib/auth';
import { Client } from 'pg';
import { createId } from '@paralleldrive/cuid2';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { getEventLifecycle } from '@/lib/event-lifecycle';

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        deleted: false,
        OR: [
          { endAt: { gte: new Date() } },
          { endAt: null },
          { startAt: { gte: new Date() } }
        ]
      },
      include: {
        books: true,
        author: { select: { name: true } },
        analytics: true
      },
      orderBy: { startAt: 'asc' },
      take: 50
    });

    const formatted = events
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        slug: event.slug,
        venue: event.venue,
        startAt: event.startAt,
        endAt: event.endAt,
        heroImageUrl: event.heroImageUrl,
        theme: event.theme,
        featured: event.featured,
        lifecycle: getEventLifecycle(event.startAt, event.endAt),
        authorName: event.author.name,
        book: event.books[0]
          ? {
              title: event.books[0].title,
              author: event.books[0].author,
              coverUrl: event.books[0].coverUrl
            }
          : null,
        attendanceCount: event.analytics?.attendanceCount ?? 0,
        totalInvites: event.analytics?.totalInvites ?? 0
      }));

    return NextResponse.json({ events: formatted });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ events: [] });
  }
}

export async function POST(req: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    const auth = await requireAuthenticatedUser();
    if (!auth.user) return auth.errorResponse!;

    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please review the event details.',
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      venue,
      startAt,
      endAt,
      heroImageUrl,
      theme,
      organizerName,
      bookTitle,
      bookAuthor,
      bookCoverUrl,
      bookDescription
    } = parsed.data;
    const organizerEmail = auth.user.email!.toLowerCase();

    const slugBase = createSlug(title);

    // Check if slug exists
    const existingSlug = await client.query(
      'SELECT id FROM "Event" WHERE slug = $1',
      [slugBase]
    );
    const slug = existingSlug.rows.length > 0 ? `${slugBase}-${Date.now()}` : slugBase;

    // Find or create user
    let userResult = await client.query(
      'SELECT id, name FROM "User" WHERE email = $1',
      [organizerEmail]
    );

    let author;
    if (userResult.rows.length === 0) {
      const userId = createId();
      const newUser = await client.query(
        'INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3) RETURNING id, name',
        [userId, organizerEmail, organizerName]
      );
      author = newUser.rows[0];
    } else {
      author = userResult.rows[0];
      if (organizerName && author.name !== organizerName) {
        const updatedUser = await client.query(
          'UPDATE "User" SET name = $1 WHERE id = $2 RETURNING id, name',
          [organizerName, author.id]
        );
        author = updatedUser.rows[0];
      }
    }

    // Create event (status starts as PENDING_APPROVAL — admin must approve)
    const eventId = createId();
    const eventResult = await client.query(
      `INSERT INTO "Event" (id, title, description, slug, venue, "startAt", "endAt", "heroImageUrl", theme, "authorId", status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, slug`,
      [eventId, title, description, slug, venue, new Date(startAt), endAt ? new Date(endAt) : null, heroImageUrl, theme, author.id, 'PENDING_APPROVAL']
    );
    const event = eventResult.rows[0];

    // Create book
    const bookId = createId();
    await client.query(
      `INSERT INTO "Book" (id, title, author, "coverUrl", description, "eventId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bookId, bookTitle, bookAuthor, bookCoverUrl, bookDescription, event.id]
    );

    // Create analytics
    const analyticsId = createId();
    await client.query(
      `INSERT INTO "EventAnalytics" (id, "eventId", "totalInvites", "acceptedCount", "declinedCount", "preorderCount", "attendanceCount")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [analyticsId, event.id, 0, 0, 0, 0, 0]
    );

    await createAuditLog({
      action: 'event.created',
      entity: 'Event',
      entityId: event.id,
      description: `Created event: ${event.title}`,
      userId: author.id,
    });

    return NextResponse.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      organizerEmail,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({
      error: 'Database connection failed. Please ensure the database is properly configured.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}
