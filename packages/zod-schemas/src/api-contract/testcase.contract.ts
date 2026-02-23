import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod } from '../common';
import { testCaseSchema } from '../entity/test-case-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const testcaseContract = c.router({
  // === UPLOAD / REPLACE TESTCASES ===
  uploadTestcases: {
    summary: 'Upload testcases',
    description: 'Upload or replace all testcases for a problem (TEACHER owner only)',
    method: 'POST',
    path: '/api/v1/problems/:problemId/testcases',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    body: z.object({
      testcases: z
        .array(
          z.object({
            input: testCaseSchema.shape.input,
            expectedOutput: testCaseSchema.shape.expectedOutput,
          }),
        )
        .min(1, 'Vui lòng cung cấp ít nhất 1 test case'),
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          count: z.int().min(0),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === GET TESTCASE METADATA ===
  getTestcaseMeta: {
    summary: 'Get testcase metadata',
    description: 'Get metadata of testcases for a problem (count, size, last updated)',
    method: 'GET',
    path: '/api/v1/problems/:problemId/testcases/meta',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      problemId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          count: z.int().min(0),
          totalSizeBytes: z.int().min(0),
          lastUpdatedAt: commonZod.datetime.nullable(),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === DELETE ALL TESTCASES ===
  deleteTestcases: {
    summary: 'Delete all testcases',
    description: 'Delete all testcases for a problem (TEACHER owner only)',
    method: 'DELETE',
    path: '/api/v1/problems/:problemId/testcases',
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
});

Object.values(testcaseContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
