import { NextResponse } from 'next/server';
import { createEventSchema } from '@/lib/validation/event';
import { requireAuthenticatedUser } from '@/lib/auth';
import { Client } from 'pg';
import { createId } from '@paralleldrive/cuid2';

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

    // Create event
    const eventId = createId();
    const eventResult = await client.query(
      `INSERT INTO "Event" (id, title, description, slug, venue, "startAt", "endAt", "heroImageUrl", theme, "authorId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, slug`,
      [eventId, title, description, slug, venue, new Date(startAt), endAt ? new Date(endAt) : null, heroImageUrl, theme, author.id]
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
