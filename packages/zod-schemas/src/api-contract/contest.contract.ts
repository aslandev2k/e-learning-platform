import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import { contestItemSchema, contestSchema, contestStatusZod } from '../entity/contest-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const contestContract = c.router({
  // === CREATE CONTEST ===
  createContest: {
    summary: 'Create contest',
    description: 'Create a new contest in a room (TEACHER owner only)',
    method: 'POST',
    path: '/api/v1/rooms/:roomId/contests',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    body: z.object({
      name: contestSchema.shape.name,
      startAt: commonZod.datetime,
      endAt: commonZod.datetime,
    }),
    responses: {
      200: serverResponseSchema(contestSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === LIST CONTESTS IN ROOM ===
  listContests: {
    summary: 'List contests in room',
    description: 'List all contests in a room',
    method: 'GET',
    path: '/api/v1/rooms/:roomId/contests',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    query: searchOptionsSchema.extend({
      status: contestStatusZod.optional().catch(undefined),
    }),
    responses: {
      200: serverResponseSchema(searchResultsSchema(contestItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === GET CONTEST BY ID ===
  getContestById: {
    summary: 'Get contest by id',
    description: 'Get detailed contest information by id',
    method: 'GET',
    path: '/api/v1/contests/:contestId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(contestSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === UPDATE CONTEST ===
  updateContest: {
    summary: 'Update contest',
    description: 'Update contest information (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/contests/:contestId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    body: z.object({
      name: contestSchema.shape.name,
      startAt: commonZod.datetime,
      endAt: commonZod.datetime,
    }),
    responses: {
      200: serverResponseSchema(contestSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === DELETE CONTEST (soft delete) ===
  deleteContest: {
    summary: 'Delete contest',
    description: 'Soft delete a contest (TEACHER owner only)',
    method: 'DELETE',
    path: '/api/v1/contests/:contestId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(z.undefined()),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === PUBLISH CONTEST ===
  publishContest: {
    summary: 'Publish contest',
    description: 'Publish a contest so students can see it (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/contests/:contestId/publish',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(contestSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },

  // === UNPUBLISH CONTEST ===
  unpublishContest: {
    summary: 'Unpublish contest',
    description: 'Unpublish a contest back to draft (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/contests/:contestId/unpublish',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(contestSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },
});

Object.values(contestContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
