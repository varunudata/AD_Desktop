import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { DatabaseHealthStatus } from '../../shared/types/models';

// Load .env from project root or current working directory
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    let dbUrl =
      process.env.DATABASE_URL?.trim() ||
      'postgresql://postgres:postgres@localhost:5432/classflow?schema=public';

    try {
      // In Electron desktop apps, connect directly to Neon compute (strip -pooler)
      // to avoid PgBouncer idle TCP disconnects and connection pool starvation
      if (dbUrl.includes('-pooler')) {
        dbUrl = dbUrl.replace('-pooler', '');
      }

      const urlObj = new URL(dbUrl);
      if (!urlObj.searchParams.has('connect_timeout')) {
        urlObj.searchParams.set('connect_timeout', '30');
      }
      if (!urlObj.searchParams.has('pool_timeout')) {
        urlObj.searchParams.set('pool_timeout', '30');
      }
      dbUrl = urlObj.toString();
    } catch {
      // If URL parsing fails, retain raw dbUrl
    }

    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const hasUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

  if (!hasUrl) {
    return {
      connected: false,
      provider: 'postgresql',
      urlConfigured: false,
      tablesInitialized: false,
      error: 'DATABASE_URL is not configured in .env',
    };
  }

  const prisma = getPrisma();
  const startTime = Date.now();

  try {
    // Run quick connection query
    await prisma.$queryRaw`SELECT 1 as connected;`;
    const latencyMs = Date.now() - startTime;

    // Verify if tables exist by querying count of classrooms
    let tablesInitialized = false;
    try {
      await prisma.classroom.count();
      tablesInitialized = true;
    } catch {
      tablesInitialized = false;
    }

    return {
      connected: true,
      provider: 'postgresql',
      urlConfigured: true,
      tablesInitialized,
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // Cleanly reset Prisma instance if connection drops or times out
    await disconnectPrisma();
    return {
      connected: false,
      provider: 'postgresql',
      urlConfigured: true,
      tablesInitialized: false,
      error: errorMsg,
    };
  }
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
    } catch (err) {
      console.error('Error disconnecting Prisma:', err);
    } finally {
      prismaInstance = null;
    }
  }
}
