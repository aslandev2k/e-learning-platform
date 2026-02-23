import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { testcaseContract } from '@repo/zod-schemas/src/api-contract/testcase.contract';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import type { Express } from 'express';
import { prisma } from '@/lib/prisma';
import { routerDefaultOptions } from '@/middlewares/global.middelware';
import { ServerError } from '@/utils/server-error';

const s = initServer();

// ============================================================
// HELPERS
// ============================================================

const assertProblemOwner = async (problemId: number, userId: number) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId, deletedAt: null },
    select: { id: true, room: { select: { ownerId: true } } },
  });
  if (!problem) throw new ServerError(ErrorCode.ResourcesNotFound);
  if (problem.room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
  return problem;
};

// ============================================================
// ROUTER
// ============================================================

const testcaseRouter = s.router(testcaseContract, {
  // === UPLOAD / REPLACE TESTCASES ===
  uploadTestcases: async ({
    params: { problemId },
    body: { testcases },
    headers: {
      token: { userId },
    },
  }) => {
    await assertProblemOwner(problemId, userId);

    await prisma.$transaction(async (tx) => {
      await tx.testCase.deleteMany({ where: { problemId } });
      await tx.testCase.createMany({
        data: testcases.map((tc, index) => ({
          problemId,
          testNo: index + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
      });
    });

    return {
      status: 200 as const,
      body: {
        data: { count: testcases.length },
      },
    };
  },

  // === GET TESTCASE METADATA ===
  getTestcaseMeta: async ({ params: { problemId } }) => {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId, deletedAt: null },
      select: { id: true },
    });
    if (!problem) throw new ServerError(ErrorCode.ResourcesNotFound);

    const testcases = await prisma.testCase.findMany({
      where: { problemId },
      select: { input: true, expectedOutput: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const count = testcases.length;
    const totalSizeBytes = testcases.reduce(
      (sum, tc) =>
        sum + Buffer.byteLength(tc.input, 'utf8') + Buffer.byteLength(tc.expectedOutput, 'utf8'),
      0,
    );
    const lastUpdatedAt = count > 0 ? testcases[0].createdAt : null;

    return {
      status: 200 as const,
      body: {
        data: {
          count,
          totalSizeBytes,
          lastUpdatedAt,
        },
      },
    };
  },

  // === DELETE ALL TESTCASES ===
  deleteTestcases: async ({
    params: { problemId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertProblemOwner(problemId, userId);

    await prisma.testCase.deleteMany({ where: { problemId } });

    return {
      status: 200 as const,
      body: {
        data: undefined,
      },
    };
  },
});

// ============================================================
// EXPORT
// ============================================================

export const createTestcaseEndpoint = (app: Express) =>
  createExpressEndpoints(testcaseContract, testcaseRouter, app, routerDefaultOptions());
