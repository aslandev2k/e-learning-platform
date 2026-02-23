import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import { userSchema } from '../entity/user-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

// User search item (for teacher to find students)
const userSearchItemSchema = userSchema.pick({
  id: true,
  email: true,
  displayName: true,
});

export const userContract = c.router({
  // === SEARCH USERS (for teacher to add students to room) ===
  searchUsers: {
    summary: 'Search users',
    description: 'Search active students by email or name (for adding to room)',
    method: 'GET',
    path: '/api/v1/users/search',
    headers: jwtAuthHeaderSchema,
    query: searchOptionsSchema,
    responses: {
      200: serverResponseSchema(searchResultsSchema(userSearchItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden),
  },

  // === GET USER BY ID ===
  getUserById: {
    summary: 'Get user by id',
    description: 'Get user basic info by id',
    method: 'GET',
    path: '/api/v1/users/:userId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      userId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(userSearchItemSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(userContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
