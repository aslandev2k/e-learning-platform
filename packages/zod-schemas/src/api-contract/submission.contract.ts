import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import {
  languageZod,
  overallVerdictZod,
  submissionDetailSchema,
  submissionItemSchema,
  submissionSchema,
} from '../entity/submission-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const submissionContract = c.router({
  // === CREATE SUBMISSION ===
  createSubmission: {
    summary: 'Create submission',
    description: 'Submit code for a problem (STUDENT only)',
    method: 'POST',
    path: '/api/v1/problems/:problemId/submissions',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    body: z.object({
      language: languageZod,
      sourceCode: submissionSchema.shape.sourceCode,
      contestId: commonZod.entityId.nullable().optional(),
    }),
    responses: {
      200: serverResponseSchema(
        submissionSchema.pick({
          id: true,
          problemId: true,
          language: true,
          judgeStatus: true,
          createdAt: true,
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.ContestNotRunning,
      ErrorCode.RoomArchived,
      ErrorCode.TooManyAttempts,
    ),
  },

  // === LIST MY SUBMISSIONS ===
  listMySubmissions: {
    summary: 'List my submissions',
    description: 'List submissions of the current student',
    method: 'GET',
    path: '/api/v1/submissions',
    headers: jwtAuthHeaderSchema,
    query: searchOptionsSchema.extend({
      roomId: commonZod.pathId.optional().catch(undefined),
      contestId: commonZod.pathId.optional().catch(undefined),
      problemId: commonZod.pathId.optional().catch(undefined),
      verdict: overallVerdictZod.optional().catch(undefined),
    }),
    responses: {
      200: serverResponseSchema(searchResultsSchema(submissionItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden),
  },

  // === GET SUBMISSION BY ID ===
  getSubmissionById: {
    summary: 'Get submission by id',
    description: 'Get detailed submission information by id',
    method: 'GET',
    path: '/api/v1/submissions/:submissionId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      submissionId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(submissionDetailSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === LIST SUBMISSIONS IN ROOM (TEACHER) ===
  listRoomSubmissions: {
    summary: 'List submissions in room',
    description: 'List all submissions in a room (TEACHER owner only)',
    method: 'GET',
    path: '/api/v1/rooms/:roomId/submissions',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    query: searchOptionsSchema.extend({
      contestId: commonZod.pathId.optional().catch(undefined),
      problemId: commonZod.pathId.optional().catch(undefined),
      studentId: commonZod.pathId.optional().catch(undefined),
      verdict: overallVerdictZod.optional().catch(undefined),
    }),
    responses: {
      200: serverResponseSchema(searchResultsSchema(submissionItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(submissionContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
