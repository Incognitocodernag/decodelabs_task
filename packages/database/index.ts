import { PrismaClient } from '@prisma/client';
import path from 'path';

export * from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const dbPath = path.join(__dirname, 'dev.db');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${dbPath}?connection_limit=1`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
