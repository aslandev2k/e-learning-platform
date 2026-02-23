import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { problemContract } from '@repo/zod-schemas/src/api-contract/problem.contract';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import type { Express } from 'express';
import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { routerDefaultOptions } from '@/middlewares/global.middelware';
import { ServerError } from '@/utils/server-error';

const s = initServer();

// ============================================================
// PRISMA SELECT
// ============================================================

const problemSelect = {
  id: true,
  title: true,
  statement: true,
  inputSpec: true,
  outputSpec: true,
  constraints: true,
  timeLimitMs: true,
  memoryLimitKb: true,
  status: true,
  roomId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ProblemSelect;

const problemItemSelect = {
  ...problemSelect,
  room: {
    select: { name: true },
  },
  _count: {
    select: { testcases: true },
  },
} satisfies Prisma.ProblemSelect;

// ============================================================
// HELPERS
// ============================================================

const assertRoomOwner = async (roomId: number, userId: number) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId, deletedAt: null },
    select: { ownerId: true },
  });
  if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);
  if (room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
};

const assertProblemOwner = async (problemId: number, userId: number) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId, deletedAt: null },
    select: { id: true, status: true, room: { select: { ownerId: true } } },
  });
  if (!problem) throw new ServerError(ErrorCode.ResourcesNotFound);
  if (problem.room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
  return problem;
};

// ============================================================
// ROUTER
// ============================================================

const problemRouter = s.router(problemContract, {
  // === CREATE PROBLEM ===
  createProblem: async ({
    params: { roomId },
    body,
    headers: {
      token: { userId },
    },
  }) => {
    await assertRoomOwner(roomId, userId);

    const created = await prisma.problem.create({
      data: {
        ...body,
        roomId,
      },
      select: problemSelect,
    });

    return {
      status: 200 as const,
      body: {
        data: created,
      },
    };
  },

  // === LIST PROBLEMS IN ROOM ===
  listProblems: async ({ params: { roomId }, query: { query, pageIndex, pageSize, status } }) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId, deletedAt: null },
      select: { id: true },
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);

    const where: Prisma.ProblemWhereInput = {
      roomId,
      deletedAt: null,
      ...(status && { status }),
      ...(query && {
        title: { contains: query, mode: 'insensitive' },
      }),
    };

    const [rawItems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        select: problemItemSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.problem.count({ where }),
    ]);

    const items = rawItems.map(({ room: r, _count, ...rest }) => ({
      ...rest,
      roomName: r.name,
      testCaseCount: _count.testcases,
    }));

    return {
      status: 200 as const,
      body: {
        data: {
          items,
          total,
          pageIndex,
          pageSize,
        },
      },
    };
  },

  // === GET PROBLEM BY ID ===
  getProblemById: async ({ params: { problemId } }) => {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId, deletedAt: null },
      select: problemSelect,
    });
    if (!problem) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        data: problem,
      },
    };
  },

  // === UPDATE PROBLEM ===
  updateProblem: async ({
    params: { problemId },
    body,
    headers: {
      token: { userId },
    },
  }) => {
    await assertProblemOwner(problemId, userId);

    const updated = await prisma.problem.update({
      where: { id: problemId },
      data: body,
      select: problemSelect,
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === DELETE PROBLEM (soft delete) ===
  deleteProblem: async ({
    params: { problemId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertProblemOwner(problemId, userId);

    await prisma.problem.update({
      where: { id: problemId },
      data: { deletedAt: new Date() },
    });

    return {
      status: 200 as const,
      body: {
        data: undefined,
      },
    };
  },

  // === PUBLISH PROBLEM ===
  publishProblem: async ({
    params: { problemId },
    headers: {
      token: { userId },
    },
  }) => {
    const problem = await assertProblemOwner(problemId, userId);
    if (problem.status !== 'DRAFT') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.problem.update({
      where: { id: problemId },
      data: { status: 'PUBLISHED' },
      select: { id: true, status: true },
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === UNPUBLISH PROBLEM ===
  unpublishProblem: async ({
    params: { problemId },
    headers: {
      token: { userId },
    },
  }) => {
    const problem = await assertProblemOwner(problemId, userId);
    if (problem.status !== 'PUBLISHED') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.problem.update({
      where: { id: problemId },
      data: { status: 'DRAFT' },
      select: { id: true, status: true },
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },
});

// ============================================================
// EXPORT
// ============================================================

export const createProblemEndpoint = (app: Express) =>
  createExpressEndpoints(problemContract, problemRouter, app, routerDefaultOptions());
