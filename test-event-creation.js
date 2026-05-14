const { Client } = require('pg');
const { createId } = require('@paralleldrive/cuid2');
require('dotenv').config();

async function testEventCreation() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Test user lookup/creation
    const organizerEmail = 'test@example.com';
    console.log('Checking user...');
    let userResult = await client.query(
      'SELECT id, name FROM "User" WHERE email = $1',
      [organizerEmail]
    );

    let author;
    if (userResult.rows.length === 0) {
      console.log('Creating user...');
      const userId = createId();
      const newUser = await client.query(
        'INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3) RETURNING id, name',
        [userId, organizerEmail, 'Test User']
      );
      author = newUser.rows[0];
      console.log('User created:', author);
    } else {
      author = userResult.rows[0];
      console.log('User found:', author);
    }

    // Test event creation
    console.log('Creating event...');
    const eventId = createId();
    const eventResult = await client.query(
      `INSERT INTO "Event" (id, title, description, slug, venue, "startAt", "endAt", "heroImageUrl", theme, "authorId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title, slug`,
      [eventId, 'Test Event', 'Test Description', 'test-event', 'Test Venue', new Date(), null, null, 'default', author.id]
    );
    const event = eventResult.rows[0];
    console.log('Event created:', event);

    // Test book creation
    console.log('Creating book...');
    const bookId = createId();
    await client.query(
      `INSERT INTO "Book" (id, title, author, "coverUrl", description, "eventId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bookId, 'Test Book', 'Test Author', null, 'Test Description', event.id]
    );
    console.log('Book created');

    // Test analytics creation
    console.log('Creating analytics...');
    const analyticsId = createId();
    await client.query(
      `INSERT INTO "EventAnalytics" (id, "eventId", "totalInvites", "acceptedCount", "declinedCount", "preorderCount", "attendanceCount")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [analyticsId, event.id, 0, 0, 0, 0, 0]
    );
    console.log('Analytics created');

    console.log('All tests passed!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await client.end();
  }
}

testEventCreation();