import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod } from '../common';
import { contestProblemItemSchema, contestProblemSchema } from '../entity/contest-problem-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const contestProblemContract = c.router({
  // === LIST PROBLEMS IN CONTEST ===
  listContestProblems: {
    summary: 'List problems in contest',
    description: 'List all problems assigned to a contest',
    method: 'GET',
    path: '/api/v1/contests/:contestId/problems',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(z.array(contestProblemItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === ASSIGN PROBLEMS TO CONTEST ===
  assignProblems: {
    summary: 'Assign problems to contest',
    description: 'Assign one or more problems to a contest (TEACHER owner only)',
    method: 'POST',
    path: '/api/v1/contests/:contestId/problems',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    body: z.object({
      problems: z
        .array(
          z.object({
            problemId: commonZod.entityId,
            maxScore: contestProblemSchema.shape.maxScore,
          }),
        )
        .min(1, 'Vui lòng chọn ít nhất 1 bài toán'),
    }),
    responses: {
      200: serverResponseSchema(z.array(contestProblemItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.DuplicateEntry,
    ),
  },

  // === REMOVE PROBLEM FROM CONTEST ===
  removeProblem: {
    summary: 'Remove problem from contest',
    description: 'Remove a problem from a contest (TEACHER owner only)',
    method: 'DELETE',
    path: '/api/v1/contests/:contestId/problems/:problemId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
      problemId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(z.undefined()),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(contestProblemContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
