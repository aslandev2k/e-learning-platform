import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import { accountStatusZod, roleZod, userItemSchema, userSchema } from '../entity/user-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const adminContract = c.router({
  // === LIST USERS ===
  listUsers: {
    summary: 'Admin list users',
    description: 'List all users with filters (ADMIN only)',
    method: 'GET',
    path: '/api/v1/admin/users',
    headers: jwtAuthHeaderSchema,
    query: searchOptionsSchema.extend({
      role: roleZod.optional().catch(undefined),
      status: accountStatusZod.optional().catch(undefined),
      sortBy: z.enum(['displayName', 'email', 'createdAt']).optional().catch(undefined),
    }),
    responses: {
      200: serverResponseSchema(searchResultsSchema(userItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden),
  },

  // === GET USER BY ID ===
  getUserById: {
    summary: 'Admin get user by id',
    description: 'Get user detail by id (ADMIN only)',
    method: 'GET',
    path: '/api/v1/admin/users/:userId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      userId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(userSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === LOCK USER ===
  lockUser: {
    summary: 'Lock user account',
    description: 'Lock a user account (ADMIN only)',
    method: 'PUT',
    path: '/api/v1/admin/users/:userId/lock',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      userId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(userSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },

  // === UNLOCK USER ===
  unlockUser: {
    summary: 'Unlock user account',
    description: 'Unlock a locked user account (ADMIN only)',
    method: 'PUT',
    path: '/api/v1/admin/users/:userId/unlock',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      userId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(userSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },

  // === RESET USER PASSWORD ===
  resetUserPassword: {
    summary: 'Admin reset user password',
    description: 'Reset a user password directly (ADMIN only)',
    method: 'PUT',
    path: '/api/v1/admin/users/:userId/reset-password',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      userId: commonZod.pathId,
    }),
    body: z.object({
      newPassword: commonZod.newPassword,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          message: z.string(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(adminContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
