import { Redis } from 'ioredis';
import { envData } from '@/env-data';
import { logger } from '@/utils/logger';

const redis = new Redis({
  host: envData.REDIS_HOST,
  port: envData.REDIS_PORT,
});

redis.on('connect', () => {
  logger.verbose(`Connect redis success at ${envData.REDIS_HOST}:${envData.REDIS_PORT}`);
});
redis.on('error', (error) => {
  logger.error(`Trying to connect to redis ${envData.REDIS_HOST}:${envData.REDIS_PORT}`, error);
});

export default redis;
