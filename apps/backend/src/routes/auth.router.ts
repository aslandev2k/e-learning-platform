import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import type { Express } from 'express';
import { prisma } from '@/lib/prisma';
import { routerDefaultOptions } from '@/middlewares/global.middelware';
import { ActionLimitService, RateLimitAction } from '@/services/action-limit.service';
import { TokenService } from '@/services/auth-token.service';
import { PasswordService } from '@/services/password.service';
import { logger } from '@/utils/logger';
import { ServerError } from '@/utils/server-error';

const s = initServer();

const authRouter = s.router(authContract, {
  login: async ({ body }) => {
    const { username, password } = body;

    const limiter = ActionLimitService.createLimiter(RateLimitAction.LOGIN_FAILED, username);
    await limiter.checkEligibilityOrThrow();

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new ServerError(ErrorCode.InvalidCredentials);
    const { passwordMatched } = await PasswordService.verify(password, user.passwordHash);
    if (!passwordMatched) {
      limiter.logAction();
      throw new ServerError(ErrorCode.InvalidCredentials);
    }

    const { authToken } = TokenService.createAuthToken(user.id);
    limiter.resetLimit();
    return {
      status: 200 as const,
      body: {
        success: true,
        data: { accessToken: authToken },
      },
    };
  },
  changePassword: async ({
    body: { newPassword, username, oldPassword },
    headers: {
      token: { userId },
    },
  }) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new ServerError(ErrorCode.InvalidCredentials);

    // Chỉ cho phép đổi mật khẩu của chính mình, trừ khi là admin (có thể bỏ oldPassword)
    if (user.id !== userId) throw new ServerError(ErrorCode.Forbidden);

    if (oldPassword) {
      const { passwordMatched } = await PasswordService.verify(oldPassword, user.passwordHash);
      if (!passwordMatched) throw new ServerError(ErrorCode.InvalidCredentials);
    }

    const passwordHash = await PasswordService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      status: 200 as const,
      body: {},
    };
  },
  logout: async ({ headers: { authorization }, req, res }) => {
    await TokenService.invalidateToken(authorization);
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(new Error('Failed to destroy session'));
        else resolve();
      });
    });
    logger.debug('session destroy ~ req.sessionID:', req.sessionID);
    res.clearCookie('connect.sid');
    return { status: 200 as const, body: {} };
  },
});

export const createAuthEndpoint = (app: Express) =>
  createExpressEndpoints(authContract, authRouter, app, routerDefaultOptions());
