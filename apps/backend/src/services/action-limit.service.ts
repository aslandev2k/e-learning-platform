import { parseTime, type TimeStringValue } from '@repo/shared/src/common/time.utils';
import { delay } from '@repo/shared/src/common/timer.helper';
import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import redis from '@/config/redis';
import { logger } from '@/utils/logger';
import { ServerError } from '@/utils/server-error';

export const RateLimitAction = {
  RESET_PASSWORD: 'RESET_PASSWORD',
  REQUEST_CHANGE_EMAIL: 'REQUEST_CHANGE_EMAIL',
  CHANGE_EMAIL: 'CHANGE_EMAIL',
  INITIATE_EMAIL_CHANGE: 'INITIATE_EMAIL_CHANGE',
  LOGIN_FAILED: 'LOGIN_FAILED',
  SEND_VERIFY_EMAIL: 'SEND_VERIFY_EMAIL',
  VERIFY_EMAIL_BY_OTP: 'VERIFY_EMAIL_OTP',
} as const;
export type RateLimitAction = (typeof RateLimitAction)[keyof typeof RateLimitAction];
export const RATE_LIMIT_RULES: Record<
  RateLimitAction,
  { timeToLive: TimeStringValue; maxActions: number }
> = {
  [RateLimitAction.RESET_PASSWORD]: {
    maxActions: 5,
    timeToLive: '24h',
  },
  [RateLimitAction.LOGIN_FAILED]: {
    maxActions: 5,
    timeToLive: '1m',
  },
  [RateLimitAction.REQUEST_CHANGE_EMAIL]: {
    maxActions: 1,
    timeToLive: '5m',
  },
  [RateLimitAction.CHANGE_EMAIL]: {
    maxActions: 1,
    timeToLive: '24h',
  },
  [RateLimitAction.SEND_VERIFY_EMAIL]: {
    maxActions: 3,
    timeToLive: '3m',
  },
  [RateLimitAction.INITIATE_EMAIL_CHANGE]: {
    maxActions: 3,
    timeToLive: '3m',
  },
  [RateLimitAction.VERIFY_EMAIL_BY_OTP]: {
    maxActions: 5,
    timeToLive: '1m',
  },
};

const KEY_PREFIX = 'action-limit';

function getContext(action: RateLimitAction, identity: string) {
  const rule = RATE_LIMIT_RULES[action];
  const { timeToLive, maxActions } = rule;
  const key = `${KEY_PREFIX}:${identity}:${action}`;
  const nowMs = Date.now();
  const outdateMs = nowMs - parseTime.toMilliseconds(timeToLive);
  return { key, maxActions, outdateMs, nowMs, timeToLive };
}

/**
 * Record an action. Call this AFTER `checkEligibility` confirms success.
 */
async function logAction(action: RateLimitAction, identity: string): Promise<void> {
  const { key, maxActions, nowMs, outdateMs, timeToLive } = getContext(action, identity);

  await redis.zremrangebyscore(key, 0, outdateMs);

  const numberOfActions = await redis.zcard(key);
  if (numberOfActions >= maxActions) {
    logger.error('You should check checkEligibility before logAction.', {
      action,
      identity,
    });
    throw new ServerError(ErrorCode.TooManyAttempts);
  }

  await redis.zadd(key, `${nowMs}`, `${nowMs}`);
  await redis.expire(key, parseTime.toSeconds(timeToLive));
}

/**
 * Check whether the action is still within the allowed limit.
 * Returns `{ success: true }` or `{ success: false, nextAllowedAt }`.
 */
async function checkEligibility(
  action: RateLimitAction,
  identity: string,
): Promise<{ success: true } | { success: false; nextAllowedAt: Date }> {
  const { key, maxActions, outdateMs, timeToLive } = getContext(action, identity);

  await redis.zremrangebyscore(key, 0, outdateMs);

  const numberOfActions = await redis.zcard(key);
  if (numberOfActions < maxActions) return { success: true };

  const oldest = await redis.zrange(key, 0, 0);
  const oldestTimestamp = Number.parseInt(oldest[0]);
  const nextAllowedAt = new Date(oldestTimestamp + parseTime.toMilliseconds(timeToLive));
  return { success: false, nextAllowedAt };
}

/**
 * Check eligibility and throw `TooManyAttempts` error if not eligible.
 */
async function checkEligibilityOrThrow(action: RateLimitAction, identity: string): Promise<void> {
  const result = await checkEligibility(action, identity);
  if (!result.success) {
    await delay(1000); // anti-spam
    throw new ServerError(ErrorCode.TooManyAttempts);
  }
}

/**
 * Reset (clear) the rate limit for a specific identity + action.
 */
async function resetLimit(action: RateLimitAction, identity: string): Promise<void> {
  const { key } = getContext(action, identity);
  await redis.del(key);
}

function createLimiter(action: RateLimitAction, identity: string) {
  return {
    checkEligibilityOrThrow: () => checkEligibilityOrThrow(action, identity),
    logAction: () => logAction(action, identity),
    resetLimit: () => resetLimit(action, identity),
  };
}

export const ActionLimitService = {
  createLimiter,
};
