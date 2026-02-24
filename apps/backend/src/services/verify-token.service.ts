import crypto from 'node:crypto';
import redis from '@/config/redis';

const VERIFY_EMAIL_PREFIX = 'verify-email';
const RESET_PASSWORD_PREFIX = 'reset-password';
const TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Verify Email Token ─────────────────────────────────────────────

async function createVerifyEmailToken(userId: number): Promise<string> {
  const otp = generateOtp();
  const key = `${VERIFY_EMAIL_PREFIX}:${otp}`;
  await redis.set(key, String(userId), 'EX', TOKEN_TTL_SECONDS);
  return otp;
}

async function consumeVerifyEmailToken(otp: string): Promise<number | null> {
  const key = `${VERIFY_EMAIL_PREFIX}:${otp}`;
  const userId = await redis.get(key);
  if (!userId) return null;
  await redis.del(key);
  return Number(userId);
}

// ─── Reset Password Token ───────────────────────────────────────────

async function createResetPasswordToken(userId: number): Promise<string> {
  const otp = generateOtp();
  const key = `${RESET_PASSWORD_PREFIX}:${otp}`;
  await redis.set(key, String(userId), 'EX', TOKEN_TTL_SECONDS);
  return otp;
}

async function consumeResetPasswordToken(token: string): Promise<number | null> {
  const key = `${RESET_PASSWORD_PREFIX}:${token}`;
  const userId = await redis.get(key);
  if (!userId) return null;
  await redis.del(key);
  return Number(userId);
}

export const VerifyTokenService = {
  createVerifyEmailToken,
  consumeVerifyEmailToken,
  createResetPasswordToken,
  consumeResetPasswordToken,
};
