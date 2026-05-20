import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function buildPrismaUrl() {
  const url = process.env.DATABASE_URL || '';
  const extra = 'connection_limit=1&pool_timeout=10&statement_timeout=15000';
  return url.includes('?') ? `${url}&${extra}` : `${url}?${extra}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildPrismaUrl() } },
    log: ['error'],
    errorFormat: 'pretty'
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
