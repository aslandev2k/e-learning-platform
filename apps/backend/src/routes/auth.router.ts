import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import type { Express } from 'express';
import { prisma } from '@/lib/prisma';
import { routerDefaultOptions } from '@/middlewares/global.middelware';
import { ActionLimitService, RateLimitAction } from '@/services/action-limit.service';
import { TokenService } from '@/services/auth-token.service';
import { EmailService } from '@/services/email.service';
import { PasswordService } from '@/services/password.service';
import { VerifyTokenService } from '@/services/verify-token.service';
import { logger } from '@/utils/logger';
import { ServerError } from '@/utils/server-error';

const s = initServer();

const authRouter = s.router(authContract, {
  // === REGISTER ===
  register: async ({ body }) => {
    const { email, password, displayName, role } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ServerError(ErrorCode.DuplicateEmail);

    const passwordHash = await PasswordService.hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role,
        status: 'PENDING_EMAIL_VERIFY',
      },
    });

    const otp = await VerifyTokenService.createVerifyEmailToken(user.id);
    await EmailService.sendVerificationEmail(email, otp);

    return {
      status: 200 as const,
      body: {
        success: true,
        data: { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' },
      },
    };
  },

  // === VERIFY EMAIL ===
  verifyEmail: async ({ body: { token } }) => {
    const limiter = ActionLimitService.createLimiter(RateLimitAction.VERIFY_EMAIL_BY_OTP, token);
    await limiter.checkEligibilityOrThrow();

    const userId = await VerifyTokenService.consumeVerifyEmailToken(token);
    if (!userId) {
      limiter.logAction();
      throw new ServerError(ErrorCode.InvalidToken);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
    });

    return {
      status: 200 as const,
      body: {
        success: true,
        data: { message: 'Xác thực email thành công.' },
      },
    };
  },

  // === RESEND VERIFY EMAIL ===
  resendVerify: async ({ body: { email } }) => {
    const limiter = ActionLimitService.createLimiter(RateLimitAction.SEND_VERIFY_EMAIL, email);
    await limiter.checkEligibilityOrThrow();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);

    const otp = await VerifyTokenService.createVerifyEmailToken(user.id);
    await EmailService.sendVerificationEmail(email, otp);
    limiter.logAction();

    return {
      status: 200 as const,
      body: {
        success: true,
        data: { message: 'Đã gửi lại mã xác thực. Vui lòng kiểm tra email.' },
      },
    };
  },

  // === LOGIN ===
  login: async ({ body }) => {
    const { email, password } = body;

    const limiter = ActionLimitService.createLimiter(RateLimitAction.LOGIN_FAILED, email);
    await limiter.checkEligibilityOrThrow();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ServerError(ErrorCode.InvalidCredentials);

    if (user.status === 'PENDING_EMAIL_VERIFY')
      throw new ServerError(ErrorCode.AccountPendingVerify);
    if (user.status === 'LOCKED') throw new ServerError(ErrorCode.AccountLocked);

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
        data: {
          accessToken: authToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            status: user.status,
          },
        },
      },
    };
  },

  // === LOGOUT ===
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
    return { status: 200 as const, body: { success: true, data: undefined } };
  },

  // === GET ME ===
  getMe: async ({
    headers: {
      token: { userId },
    },
  }) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
          status: user.status,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      },
    };
  },

  // === FORGOT PASSWORD ===
  forgotPassword: async ({ body: { email } }) => {
    const limiter = ActionLimitService.createLimiter(RateLimitAction.RESET_PASSWORD, email);
    await limiter.checkEligibilityOrThrow();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);

    const token = await VerifyTokenService.createResetPasswordToken(user.id);
    await EmailService.sendPasswordResetEmail(email, token);
    limiter.logAction();

    return {
      status: 200 as const,
      body: {
        success: true,
        data: { message: 'Đã gửi mã đặt lại mật khẩu. Vui lòng kiểm tra email.' },
      },
    };
  },

  // === RESET PASSWORD ===
  resetPassword: async ({ body: { token, newPassword } }) => {
    const userId = await VerifyTokenService.consumeResetPasswordToken(token);
    if (!userId) throw new ServerError(ErrorCode.InvalidToken);

    const passwordHash = await PasswordService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return {
      status: 200 as const,
      body: {
        success: true,
        data: { message: 'Đặt lại mật khẩu thành công.' },
      },
    };
  },

  // === CHANGE PASSWORD ===
  changePassword: async ({
    body: { newPassword, oldPassword },
    headers: {
      token: { userId },
    },
  }) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ServerError(ErrorCode.InvalidCredentials);

    const { passwordMatched } = await PasswordService.verify(oldPassword, user.passwordHash);
    if (!passwordMatched) throw new ServerError(ErrorCode.InvalidCredentials);

    const passwordHash = await PasswordService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      status: 200 as const,
      body: {
        success: true,
        data: { message: 'Đổi mật khẩu thành công' },
      },
    };
  },
});

export const createAuthEndpoint = (app: Express) =>
  createExpressEndpoints(authContract, authRouter, app, routerDefaultOptions());
