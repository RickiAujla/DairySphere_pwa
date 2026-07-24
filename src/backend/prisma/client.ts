import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Returns the PrismaClient instance, reading DATABASE_URL
 * strictly from process.env.DATABASE_URL.
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const dbUrl = process.env.DATABASE_URL || '';
    
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

// Lazy Proxy export to prevent top-level initialization errors on module import
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    const client = getPrismaClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Checks if DATABASE_URL is provided in process.env and whether PostgreSQL is reachable.
 */
export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string }> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '') {
    return {
      connected: false,
      error: 'DATABASE_URL environment variable is missing.',
    };
  }

  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    return {
      connected: false,
      error: 'DATABASE_URL points to localhost, which is unreachable in the Google AI Studio container environment.',
    };
  }

  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Detects whether the application is running without a reachable PostgreSQL database
 * and logs a clear startup diagnostic message without crashing the application.
 */
export async function verifyDatabaseConnectionOnStartup(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.trim() === '') {
    console.warn('\n================================================================================');
    console.warn('[DATABASE CONFIGURATION REQUIRED]');
    console.warn('DATABASE_URL environment variable is MISSING in process.env.');
    console.warn('This environment (Google AI Studio) does NOT provide a local PostgreSQL server.');
    console.warn('To enable persistent database storage, please configure the DATABASE_URL environment');
    console.warn('variable in Settings with a valid PostgreSQL connection string.');
    console.warn('================================================================================\n');
    return false;
  }

  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.warn('\n================================================================================');
    console.warn('[DATABASE CONFIGURATION REQUIRED]');
    console.warn(`DATABASE_URL is set to a localhost address ("${dbUrl}").`);
    console.warn('Google AI Studio runs in a containerized environment without a local PostgreSQL server.');
    console.warn('Please update DATABASE_URL in environment settings to point to a reachable PostgreSQL host.');
    console.warn('================================================================================\n');
    return false;
  }

  try {
    const client = getPrismaClient();
    await client.$connect();
    console.log('[DairySphere Backend] PostgreSQL database connection verified successfully via process.env.DATABASE_URL.');
    return true;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('\n================================================================================');
    console.warn('[DATABASE CONNECTION FAILED]');
    console.warn('Failed to connect to the PostgreSQL database specified in process.env.DATABASE_URL.');
    console.warn(`Error: ${errMsg}`);
    console.warn('Please verify that the PostgreSQL database is online and accessible.');
    console.warn('================================================================================\n');
    return false;
  }
}
