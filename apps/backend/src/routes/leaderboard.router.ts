import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { leaderboardContract } from '@repo/zod-schemas/src/api-contract/leaderboard.contract';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import type { Express } from 'express';
import { prisma } from '@/lib/prisma';
import { routerDefaultOptions } from '@/middlewares/global.middelware';
import { ServerError } from '@/utils/server-error';

const s = initServer();

// ============================================================
// ROUTER
// ============================================================

const leaderboardRouter = s.router(leaderboardContract, {
  // === GET CONTEST LEADERBOARD ===
  getContestLeaderboard: async ({ params: { contestId } }) => {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId, deletedAt: null },
      select: { id: true },
    });
    if (!contest) throw new ServerError(ErrorCode.ResourcesNotFound);

    const scores = await prisma.contestScore.findMany({
      where: { contestId },
      select: {
        studentId: true,
        problemId: true,
        bestScore: true,
        lastSubmissionAt: true,
        student: { select: { displayName: true } },
        problem: { select: { title: true } },
      },
      orderBy: [{ studentId: 'asc' }, { problemId: 'asc' }],
    });

    const studentMap = new Map<
      number,
      {
        studentId: number;
        studentName: string;
        totalScore: number;
        scores: {
          problemId: number;
          problemTitle: string;
          bestScore: number;
          lastSubmissionAt: Date | null;
        }[];
      }
    >();

    for (const score of scores) {
      let row = studentMap.get(score.studentId);
      if (!row) {
        row = {
          studentId: score.studentId,
          studentName: score.student.displayName,
          totalScore: 0,
          scores: [],
        };
        studentMap.set(score.studentId, row);
      }
      row.totalScore += score.bestScore;
      row.scores.push({
        problemId: score.problemId,
        problemTitle: score.problem.title,
        bestScore: score.bestScore,
        lastSubmissionAt: score.lastSubmissionAt,
      });
    }

    const data = Array.from(studentMap.values()).sort((a, b) => b.totalScore - a.totalScore);

    return {
      status: 200 as const,
      body: {
        data,
      },
    };
  },
});

// ============================================================
// EXPORT
// ============================================================

export const createLeaderboardEndpoint = (app: Express) =>
  createExpressEndpoints(leaderboardContract, leaderboardRouter, app, routerDefaultOptions());
