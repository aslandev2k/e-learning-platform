import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import { problemItemSchema, problemSchema, problemStatusZod } from '../entity/problem-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const problemContract = c.router({
  // === CREATE PROBLEM ===
  createProblem: {
    summary: 'Create problem',
    description: 'Create a new problem in a room (TEACHER owner only)',
    method: 'POST',
    path: '/api/v1/rooms/:roomId/problems',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    body: z.object({
      title: problemSchema.shape.title,
      statement: problemSchema.shape.statement,
      inputSpec: problemSchema.shape.inputSpec.optional(),
      outputSpec: problemSchema.shape.outputSpec.optional(),
      constraints: problemSchema.shape.constraints.optional(),
      timeLimitMs: problemSchema.shape.timeLimitMs,
      memoryLimitKb: problemSchema.shape.memoryLimitKb,
    }),
    responses: {
      200: serverResponseSchema(problemSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === LIST PROBLEMS IN ROOM ===
  listProblems: {
    summary: 'List problems in room',
    description: 'List all problems in a room',
    method: 'GET',
    path: '/api/v1/rooms/:roomId/problems',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    query: searchOptionsSchema.extend({
      status: problemStatusZod.optional().catch(undefined),
    }),
    responses: {
      200: serverResponseSchema(searchResultsSchema(problemItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === GET PROBLEM BY ID ===
  getProblemById: {
    summary: 'Get problem by id',
    description: 'Get detailed problem information by id',
    method: 'GET',
    path: '/api/v1/problems/:problemId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(problemSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === UPDATE PROBLEM ===
  updateProblem: {
    summary: 'Update problem',
    description: 'Update problem information (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/problems/:problemId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    body: z.object({
      title: problemSchema.shape.title,
      statement: problemSchema.shape.statement,
      inputSpec: problemSchema.shape.inputSpec.optional(),
      outputSpec: problemSchema.shape.outputSpec.optional(),
      constraints: problemSchema.shape.constraints.optional(),
      timeLimitMs: problemSchema.shape.timeLimitMs,
      memoryLimitKb: problemSchema.shape.memoryLimitKb,
    }),
    responses: {
      200: serverResponseSchema(problemSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === DELETE PROBLEM (soft delete) ===
  deleteProblem: {
    summary: 'Delete problem',
    description: 'Soft delete a problem (TEACHER owner only)',
    method: 'DELETE',
    path: '/api/v1/problems/:problemId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(z.undefined()),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === PUBLISH PROBLEM ===
  publishProblem: {
    summary: 'Publish problem',
    description: 'Publish a problem so students can see it (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/problems/:problemId/publish',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(problemSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },

  // === UNPUBLISH PROBLEM ===
  unpublishProblem: {
    summary: 'Unpublish problem',
    description: 'Unpublish a problem back to draft (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/problems/:problemId/unpublish',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(problemSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },
});

Object.values(problemContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
