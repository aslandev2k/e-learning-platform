import { PrismaPg } from '@prisma/adapter-pg';
import { envData } from '@/env-data';
import { PrismaClient } from '@/generated/prisma';
import { logger } from '@/utils/logger';

const adapter = new PrismaPg({ connectionString: envData.DATABASE_URL });

export const prisma = new PrismaClient({
  transactionOptions: {
    timeout: 15000,
  },
  adapter,
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma?.$on('query', (e) => {
  const log = e.duration > 5000 ? logger.error : e.duration > 2000 ? logger.warn : logger.debug;

  const regex =
    /^(SELECT|INSERT INTO|UPDATE|DELETE|BEGIN|COMMIT|ROLLBACK)\s+(?:.*?FROM\s+)?(?:"\w+"\.)?"(\w+)"/i;

  const match = e.query.match(regex)?.map((item) => item || '');
  const info =
    match?.[1] || match?.[2]
      ? `- ${match?.[1] && `${match[1]}`} ${match?.[2] && `${match[2]}`}`
      : `${e.query.substring(0, 100)}${e.query.length > 100 ? '...' : ''}`;

  const time = e.duration < 1000 ? `${e.duration}ms` : `${(e.duration / 1000).toFixed(3)}s`;
  log(`Prisma: ${time} ${info}`);
});
