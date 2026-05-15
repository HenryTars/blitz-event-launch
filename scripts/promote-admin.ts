import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  const r = await client.query(
    'UPDATE "User" SET role = $1 WHERE email = $2 RETURNING id, email, role',
    ['SUPER_ADMIN', 'henrytarsian@gmail.com']
  );
  console.log('Updated:', r.rows[0]);
  await client.end();
}

main().catch(console.error);
