import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod } from '../common';
import { userSchema } from '../entity/user-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const authContract = c.router({
  // === REGISTER ===
  register: {
    summary: 'Register',
    description: 'Register a new TEACHER or STUDENT account',
    method: 'POST',
    path: '/api/v1/auth/register',
    body: z.object({
      email: commonZod.email,
      password: commonZod.newPassword,
      displayName: userSchema.shape.displayName,
      role: z.enum(['TEACHER', 'STUDENT']),
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.DuplicateEmail, ErrorCode.TooManyAttempts),
  },

  // === VERIFY EMAIL ===
  verifyEmail: {
    summary: 'Verify email',
    description: 'Verify email address using token or OTP',
    method: 'POST',
    path: '/api/v1/auth/verify',
    body: z.object({
      token: z.string().nonempty('Vui lòng nhập mã xác thực'),
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.InvalidToken),
  },

  // === RESEND VERIFY EMAIL ===
  resendVerify: {
    summary: 'Resend verify email',
    description: 'Resend email verification link/OTP',
    method: 'POST',
    path: '/api/v1/auth/resend-verify',
    body: z.object({
      email: commonZod.email,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.TooManyAttempts,
      ErrorCode.ResourcesNotFound,
    ),
  },

  // === LOGIN ===
  login: {
    summary: 'Login',
    description: 'Authenticate using email and password',
    method: 'POST',
    path: '/api/v1/auth/login',
    body: z.object({
      email: commonZod.email,
      password: commonZod.password,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          accessToken: z.string(),
          user: userSchema.pick({
            id: true,
            email: true,
            role: true,
            displayName: true,
            status: true,
          }),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.InvalidCredentials,
      ErrorCode.AccountPendingVerify,
      ErrorCode.AccountLocked,
    ),
  },

  // === LOGOUT ===
  logout: {
    summary: 'Logout',
    description: 'Log out the current authenticated user',
    method: 'POST',
    path: '/api/v1/auth/logout',
    headers: jwtAuthHeaderSchema,
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(z.undefined()),
    },
    metadata: OpenAPIHelper.generateErrorCodes(),
  },

  // === GET ME ===
  getMe: {
    summary: 'Get current user',
    description: 'Retrieve information of the authenticated user',
    method: 'GET',
    path: '/api/v1/auth/me',
    headers: jwtAuthHeaderSchema,
    responses: {
      200: serverResponseSchema(
        userSchema.pick({
          id: true,
          email: true,
          role: true,
          displayName: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(),
  },

  // === FORGOT PASSWORD ===
  forgotPassword: {
    summary: 'Forgot password',
    description: 'Request a password reset link via email',
    method: 'POST',
    path: '/api/v1/auth/forgot-password',
    body: z.object({
      email: commonZod.email,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.TooManyAttempts,
      ErrorCode.ResourcesNotFound,
    ),
  },

  // === RESET PASSWORD ===
  resetPassword: {
    summary: 'Reset password',
    description: 'Reset password using token from forgot-password email',
    method: 'POST',
    path: '/api/v1/auth/reset-password',
    body: z.object({
      token: z.string().nonempty('Vui lòng nhập mã xác thực'),
      newPassword: commonZod.newPassword,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.InvalidToken),
  },

  // === CHANGE PASSWORD ===
  changePassword: {
    summary: 'Change password',
    description: 'Allow an authenticated user to change their password',
    method: 'POST',
    path: '/api/v1/auth/change-password',
    headers: jwtAuthHeaderSchema,
    body: z.object({
      oldPassword: commonZod.password,
      newPassword: commonZod.newPassword,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.InvalidCredentials),
  },
});

Object.values(authContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
