import { APP_CONFIG } from '@repo/shared/src/app-config';
import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import jwt from 'jsonwebtoken';
import { v7 } from 'uuid';
import { z } from 'zod';
import { envData } from '@/env-data';
import { logger } from '@/utils/logger';
import { ServerError } from '@/utils/server-error';
import RedisService from './redis.service';

const TOKEN_ISSUER = APP_CONFIG.ID;

const tokenPayloadBaseSchema = z.object({
  sub: z.int().positive(),
  jti: z.uuid(),
  type: z.enum(['auth']),
  iss: z.literal(TOKEN_ISSUER),
});

export const tokenPayloadSchema = tokenPayloadBaseSchema.transform(({ sub, jti, type, iss }) => ({
  issuer: iss,
  jwtId: jti,
  type,
  userId: sub,
}));

export type TokenData = z.infer<typeof tokenPayloadSchema>;
export type TokenPayload = z.input<typeof tokenPayloadSchema>;

const extractToken = (str: string) => {
  const [token] = str
    .split(' ')
    .map((part) => z.jwt().safeParse(part.trim()).data)
    .filter(Boolean);
  if (!token) throw new ServerError(ErrorCode.LoginRequired);
  return token;
};

const createAuthToken = (userId: number, jwtId?: string): { authToken: string } => {
  const payload: TokenPayload = {
    sub: userId,
    iss: TOKEN_ISSUER,
    type: 'auth',
    jti: jwtId || v7(),
  };
  const authToken = jwt.sign(payload, envData.JWT_SECRET, {
    expiresIn: APP_CONFIG.TIME_VALUE.AUTH_TOKEN,
  });

  return { authToken };
};

const getTokenExpirationDate = (token: string) => {
  const decoded = jwt.decode(token) as jwt.JwtPayload;
  return decoded.exp ? new Date(decoded.exp * 1000) : new Date();
};

const getTokenPayload = (data: string): TokenPayload => {
  try {
    const token = extractToken(data);
    const payload = jwt.verify(token, envData.JWT_SECRET, {
      ignoreExpiration: true,
    });
    const checkPayload = tokenPayloadBaseSchema.safeParse(payload);
    if (checkPayload.success) return checkPayload.data;
  } catch (_error) {
    logger.error('getTokenPayload ~ error:', { data });
  }
  throw new ServerError(ErrorCode.InvalidAuthToken);
};

const resetToken = async (token: string) => {
  const payload = getTokenPayload(token);
  return jwt.sign(payload, envData.JWT_SECRET, {
    expiresIn: APP_CONFIG.TIME_VALUE.AUTH_TOKEN,
  });
};

const invalidateToken = async (authToken: string) => {
  const token = extractToken(authToken);
  const { jti } = getTokenPayload(token);
  await RedisService.markTokenAsBlacklisted(jti, getTokenExpirationDate(token));
};

const verifiedTokenSchema = tokenPayloadSchema
  .and(z.object({ iat: z.number().int(), exp: z.number().int() }))
  .transform(({ exp, iat, ...payload }) => ({
    ...payload,
    createdAt: new Date(iat * 1000),
    expiresAt: new Date(exp * 1000),
  }));

const parseVerifiedToken = (rawToken: string) => {
  try {
    const payload = jwt.verify(rawToken, envData.JWT_SECRET, {
      ignoreExpiration: true,
    }) as jwt.JwtPayload;
    return verifiedTokenSchema.parse(payload);
  } catch (error) {
    logger.warn('parseVerifiedToken ~ error:', error);
    throw new ServerError(ErrorCode.InvalidAuthToken);
  }
};

const verifyOrError = async (
  token: string,
  options?: Parameters<typeof RedisService.throwIfTokenBlacklisted>[1],
) => {
  const rawToken = extractToken(token);

  const expiresDate = getTokenExpirationDate(rawToken);
  if (expiresDate < new Date()) throw new ServerError(ErrorCode.ExpiredAuthToken);

  const data = parseVerifiedToken(rawToken);
  await RedisService.throwIfTokenBlacklisted(data.jwtId, options);
  return data;
};

export const TokenService = {
  verifyOrError,
  createAuthToken,
  getTokenPayload,
  resetToken,
  invalidateToken,
};
