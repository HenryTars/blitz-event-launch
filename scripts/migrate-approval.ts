import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  console.log('Connected.\n');

  const sqls: string[] = [
    // Create EventStatus enum
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventStatus') THEN
        CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'ARCHIVED');
      END IF;
    END $$;`,

    // Add status column (nullable first, then set default)
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'status') THEN
        ALTER TABLE "Event" ADD COLUMN "status" "EventStatus";
      END IF;
    END $$;`,

    // Set existing events: if published=true → PUBLISHED, else → PENDING_APPROVAL
    `UPDATE "Event" SET "status" = 'PUBLISHED' WHERE "published" = true AND "status" IS NULL`,
    `UPDATE "Event" SET "status" = 'PENDING_APPROVAL' WHERE "status" IS NULL`,

    // Now set NOT NULL default
    `ALTER TABLE "Event" ALTER COLUMN "status" SET NOT NULL`,
    `ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`,

    // Add new columns
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'approvedAt') THEN
        ALTER TABLE "Event" ADD COLUMN "approvedAt" TIMESTAMP(3);
      END IF;
    END $$;`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'approvedBy') THEN
        ALTER TABLE "Event" ADD COLUMN "approvedBy" TEXT;
      END IF;
    END $$;`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'rejectedAt') THEN
        ALTER TABLE "Event" ADD COLUMN "rejectedAt" TIMESTAMP(3);
      END IF;
    END $$;`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'rejectedBy') THEN
        ALTER TABLE "Event" ADD COLUMN "rejectedBy" TEXT;
      END IF;
    END $$;`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'rejectionReason') THEN
        ALTER TABLE "Event" ADD COLUMN "rejectionReason" TEXT;
      END IF;
    END $$;`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'archivedAt') THEN
        ALTER TABLE "Event" ADD COLUMN "archivedAt" TIMESTAMP(3);
      END IF;
    END $$;`,

    // Update indexes
    `DROP INDEX IF EXISTS "Event_published_deleted_idx"`,
    `DROP INDEX IF EXISTS "Event_featured_published_deleted_idx"`,
    `CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status")`,
    `CREATE INDEX IF NOT EXISTS "Event_featured_status_idx" ON "Event"("featured", "status")`,
  ];

  for (const sql of sqls) {
    try {
      await client.query(sql);
      console.log('✓', sql.substring(0, 90));
    } catch (err: any) {
      if (err.code === '42P07' || err.code === '42701' || err.code === '42P16') {
        console.log('~ Skipped:', sql.substring(0, 60));
      } else {
        console.error('✗', err.message);
        console.error('  SQL:', sql.substring(0, 120));
        throw err;
      }
    }
  }

  console.log('\nApproval migration complete.');
  await client.end();
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
