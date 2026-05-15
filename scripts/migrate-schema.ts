import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ssl = process.env.DATABASE_URL?.includes('localhost')
  ? false
  : { rejectUnauthorized: false };

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl,
  connectionTimeoutMillis: 15000,
  statement_timeout: 30000
});

const migrations: string[] = [
  // ── Enum type for roles ──
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
      CREATE TYPE "UserRole" AS ENUM ('USER', 'ORGANIZER', 'SUPER_ADMIN');
    END IF;
  END $$;`,

  // ── User table additions ──
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'role') THEN
      ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'avatarUrl') THEN
      ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'bio') THEN
      ALTER TABLE "User" ADD COLUMN "bio" TEXT;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'isSuspended') THEN
      ALTER TABLE "User" ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'suspendedAt') THEN
      ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'suspendedBy') THEN
      ALTER TABLE "User" ADD COLUMN "suspendedBy" TEXT;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
      ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END $$;`,

  // ── Event table additions ──
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'published') THEN
      ALTER TABLE "Event" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'featured') THEN
      ALTER TABLE "Event" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'deleted') THEN
      ALTER TABLE "Event" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'deletedAt') THEN
      ALTER TABLE "Event" ADD COLUMN "deletedAt" TIMESTAMP(3);
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'updatedAt') THEN
      ALTER TABLE "Event" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END $$;`,

  // ── Invitation table additions ──
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'createdBy') THEN
      ALTER TABLE "Invitation" ADD COLUMN "createdBy" TEXT;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'userId') THEN
      ALTER TABLE "Invitation" ADD COLUMN "userId" TEXT;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'laterCount') THEN
      ALTER TABLE "EventAnalytics" ADD COLUMN "laterCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
  END $$;`,

  // ── Indexes ──
  `CREATE INDEX IF NOT EXISTS "Event_authorId_idx" ON "Event"("authorId")`,
  `CREATE INDEX IF NOT EXISTS "Event_published_deleted_idx" ON "Event"("published", "deleted")`,
  `CREATE INDEX IF NOT EXISTS "Event_featured_published_deleted_idx" ON "Event"("featured", "published", "deleted")`,
  `CREATE INDEX IF NOT EXISTS "Invitation_status_idx" ON "Invitation"("status")`,
  `CREATE INDEX IF NOT EXISTS "CheckIn_scannedAt_idx" ON "CheckIn"("scannedAt")`,

  // ── New tables ──
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    "entityId" TEXT,
    description TEXT,
    metadata TEXT,
    "ipAddress" TEXT,
    "userId" TEXT REFERENCES "User"(id),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "AdminAction" (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    reason TEXT,
    metadata TEXT,
    "adminId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "SystemSettings" (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── New table indexes ──
  `CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entity", "entityId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AdminAction_adminId_idx" ON "AdminAction"("adminId")`,
  `CREATE INDEX IF NOT EXISTS "AdminAction_target_idx" ON "AdminAction"("targetType", "targetId")`,
  `CREATE INDEX IF NOT EXISTS "AdminAction_createdAt_idx" ON "AdminAction"("createdAt")`,

  // ── Set existing events as published (backfill) ──
  `UPDATE "Event" SET "published" = true WHERE "published" = false`,
];

async function migrate() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected.\n');

  for (const sql of migrations) {
    try {
      await client.query(sql);
      console.log('✓', sql.substring(0, 80) + '...');
    } catch (err: any) {
      if (err.code === '42P07' || err.code === '42701' || err.code === '23505') {
        console.log('~ Skipped (already exists):', sql.substring(0, 60) + '...');
      } else {
        console.error('✗ Error:', err.message);
        console.error('  SQL:', sql.substring(0, 120));
        throw err;
      }
    }
  }

  console.log('\nAll migrations complete.');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
