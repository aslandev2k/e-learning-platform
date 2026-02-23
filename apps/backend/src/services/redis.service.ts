import { parseTime } from '@repo/shared/src/common/time.utils';
import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { LRUCache } from 'lru-cache';
import redis from '@/config/redis';
import { ServerError } from '@/utils/server-error';

const blacklistCache = new LRUCache<string, '1' | '0'>({
  max: 10000,
  ttl: parseTime.toMilliseconds('1m'), // Each cached item expires individually 1 minute after being set
});

const markTokenAsBlacklisted = async (jti: string, tokenExpiresAt: Date) => {
  const expiresInMs = tokenExpiresAt.getTime() - Date.now();
  const expiresInSec = Math.ceil(expiresInMs / 1000);
  if (expiresInSec <= 0) return;
  await redis.set(`blacklist:${jti}`, '1', 'EX', expiresInSec);
  blacklistCache.set(jti, '1');
};

const isTokenBlacklisted = async (jti: string, useCache = true): Promise<boolean> => {
  if (useCache) {
    const cacheResult = blacklistCache.get(jti);
    if (cacheResult) return cacheResult === '1';
  }

  const isBlacklisted = !!(await redis.get(`blacklist:${jti}`));
  blacklistCache.set(jti, isBlacklisted ? '1' : '0');
  return isBlacklisted;
};

const throwIfTokenBlacklisted = async (jti: string, options = { cache: true }) => {
  const isBlacklisted = await isTokenBlacklisted(jti, options.cache);
  if (isBlacklisted) throw new ServerError(ErrorCode.TokenInBlackList);
};

const RedisService = {
  markTokenAsBlacklisted,
  throwIfTokenBlacklisted,
};

export default RedisService;
