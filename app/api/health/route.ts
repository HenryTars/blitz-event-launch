import { NextResponse } from 'next/server';
import { Client } from 'pg';
import { prisma } from '@/lib/prisma';

const DB_HOST = 'aws-1-eu-west-2.pooler.supabase.com';
const DB_PORT = 6543;

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Environment variable check
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  results.env = {
    DATABASE_URL: dbUrl ? `set (${dbUrl.length} chars)` : 'NOT SET',
    DIRECT_URL: directUrl ? `set (${directUrl.length} chars)` : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. DNS resolution
  try {
    const { promises: dns } = await import('node:dns');
    const addresses = await dns.resolve4(DB_HOST);
    results.dns = { host: DB_HOST, addresses };
  } catch (e: any) {
    results.dns = { host: DB_HOST, error: e.message };
  }

  // 3. TCP connectivity test (port 6543)
  try {
    const { Socket } = await import('node:net');
    const tcpResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      const socket = new Socket();
      const timer = setTimeout(() => {
        socket.destroy();
        resolve({ ok: false, error: 'TCP connection timed out after 5s' });
      }, 5000);
      socket.on('connect', () => {
        clearTimeout(timer);
        socket.destroy();
        resolve({ ok: true });
      });
      socket.on('error', (err) => {
        clearTimeout(timer);
        resolve({ ok: false, error: err.message });
      });
      socket.connect(DB_PORT, DB_HOST);
    });
    results.tcp = tcpResult;
  } catch (e: any) {
    results.tcp = { ok: false, error: e.message };
  }

  // 4. pg.Client connection using DATABASE_URL
  results.pg = { tested: false };
  if (dbUrl) {
    try {
      const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      const res = await client.query('SELECT 1 AS ok');
      results.pg = { ok: true, query: res.rows[0].ok === 1 ? 'SELECT 1 OK' : 'unexpected' };
      await client.end();
    } catch (e: any) {
      results.pg = { ok: false, error: e.message, code: e.code };
    }
  } else {
    results.pg = { ok: false, error: 'DATABASE_URL not set' };
  }

  // 5. Prisma connection test
  results.prisma = { tested: false };
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    results.prisma = { ok: true, userCount: count };
  } catch (e: any) {
    results.prisma = { ok: false, error: e.message, code: e.code };
  }

  return NextResponse.json(results);
}
