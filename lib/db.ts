import { Client } from 'pg';

function buildConnectionString() {
  const url = process.env.DATABASE_URL || '';
  const extra = 'statement_timeout=8000&connect_timeout=8';
  return url.includes('?') ? `${url}&${extra}` : `${url}?${extra}`;
}

export function createDbClient() {
  return new Client({
    connectionString: buildConnectionString(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000
  });
}

export async function queryUser(email: string) {
  const client = createDbClient();
  try {
    await client.connect();
    const result = await client.query(
      `SELECT id, email, name, role, "isSuspended", "avatarUrl", "createdAt", "updatedAt"
       FROM "User" WHERE email = $1 LIMIT 1`,
      [email]
    );
    return result.rows[0] ?? null;
  } finally {
    await client.end().catch(() => {});
  }
}
