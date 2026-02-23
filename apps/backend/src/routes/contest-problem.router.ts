import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { contestProblemContract } from '@repo/zod-schemas/src/api-contract/contest-problem.contract';
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

const contestProblemItemSelect = {
  id: true,
  contestId: true,
  problemId: true,
  maxScore: true,
  order: true,
  problem: {
    select: {
      title: true,
      status: true,
      timeLimitMs: true,
      memoryLimitKb: true,
    },
  },
} satisfies Prisma.ContestProblemSelect;

// ============================================================
// HELPERS
// ============================================================

const assertContestOwner = async (contestId: number, userId: number) => {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId, deletedAt: null },
    select: { id: true, room: { select: { ownerId: true } } },
  });
  if (!contest) throw new ServerError(ErrorCode.ResourcesNotFound);
  if (contest.room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
  return contest;
};

// ============================================================
// ROUTER
// ============================================================

const contestProblemRouter = s.router(contestProblemContract, {
  // === LIST PROBLEMS IN CONTEST ===
  listContestProblems: async ({ params: { contestId } }) => {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId, deletedAt: null },
      select: { id: true },
    });
    if (!contest) throw new ServerError(ErrorCode.ResourcesNotFound);

    const rawItems = await prisma.contestProblem.findMany({
      where: { contestId },
      select: contestProblemItemSelect,
      orderBy: { order: 'asc' },
    });

    const items = rawItems.map(({ problem, ...rest }) => ({
      ...rest,
      problemTitle: problem.title,
      problemStatus: problem.status,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
    }));

    return {
      status: 200 as const,
      body: {
        data: items,
      },
    };
  },

  // === ASSIGN PROBLEMS TO CONTEST ===
  assignProblems: async ({
    params: { contestId },
    body: { problems },
    headers: {
      token: { userId },
    },
  }) => {
    await assertContestOwner(contestId, userId);

    const existingLinks = await prisma.contestProblem.findMany({
      where: { contestId },
      select: { problemId: true },
    });
    const existingProblemIds = new Set(existingLinks.map((l) => l.problemId));

    const duplicates = problems.filter((p) => existingProblemIds.has(p.problemId));
    if (duplicates.length > 0) throw new ServerError(ErrorCode.DuplicateEntry);

    const maxOrder = await prisma.contestProblem.aggregate({
      where: { contestId },
      _max: { order: true },
    });
    let nextOrder = (maxOrder._max.order ?? 0) + 1;

    await prisma.contestProblem.createMany({
      data: problems.map((p) => ({
        contestId,
        problemId: p.problemId,
        maxScore: p.maxScore,
        order: nextOrder++,
      })),
    });

    const rawItems = await prisma.contestProblem.findMany({
      where: { contestId },
      select: contestProblemItemSelect,
      orderBy: { order: 'asc' },
    });

    const items = rawItems.map(({ problem, ...rest }) => ({
      ...rest,
      problemTitle: problem.title,
      problemStatus: problem.status,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
    }));

    return {
      status: 200 as const,
      body: {
        data: items,
      },
    };
  },

  // === REMOVE PROBLEM FROM CONTEST ===
  removeProblem: async ({
    params: { contestId, problemId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertContestOwner(contestId, userId);

    const link = await prisma.contestProblem.findUnique({
      where: { contestId_problemId: { contestId, problemId } },
    });
    if (!link) throw new ServerError(ErrorCode.ResourcesNotFound);

    await prisma.contestProblem.delete({
      where: { contestId_problemId: { contestId, problemId } },
    });

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

export const createContestProblemEndpoint = (app: Express) =>
  createExpressEndpoints(contestProblemContract, contestProblemRouter, app, routerDefaultOptions());
