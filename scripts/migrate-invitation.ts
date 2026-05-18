import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  statement_timeout: 30000
});

async function main() {
  await client.connect();

  const migrations: string[] = [
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'isApproved') THEN
        ALTER TABLE "Invitation" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT false;
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'reviewedAt') THEN
        ALTER TABLE "Invitation" ADD COLUMN "reviewedAt" TIMESTAMP(3);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'reviewedBy') THEN
        ALTER TABLE "Invitation" ADD COLUMN "reviewedBy" TEXT;
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Invitation' AND column_name = 'reviewNotes') THEN
        ALTER TABLE "Invitation" ADD COLUMN "reviewNotes" TEXT;
      END IF;
    END $$;`,

    `CREATE INDEX IF NOT EXISTS "Invitation_isApproved_idx" ON "Invitation"("isApproved");`
  ];

  for (const sql of migrations) {
    console.log('Running:', sql.substring(0, 80) + '...');
    await client.query(sql);
  }

  console.log('Invitation migration complete.');
  await client.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
