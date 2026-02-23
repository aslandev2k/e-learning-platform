import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { submissionContract } from '@repo/zod-schemas/src/api-contract/submission.contract';
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

const submissionSelect = {
  id: true,
  problemId: true,
  roomId: true,
  contestId: true,
  studentId: true,
  language: true,
  sourceCode: true,
  judgeStatus: true,
  overallVerdict: true,
  totalTimeMs: true,
  compileLog: true,
  passedTests: true,
  totalTests: true,
  createdAt: true,
  judgedAt: true,
} satisfies Prisma.SubmissionSelect;

const submissionItemSelect = {
  ...submissionSelect,
  student: {
    select: { displayName: true },
  },
  problem: {
    select: { title: true },
  },
} satisfies Prisma.SubmissionSelect;

const submissionDetailSelect = {
  ...submissionSelect,
  testResults: {
    select: {
      id: true,
      submissionId: true,
      testNo: true,
      verdict: true,
      timeMs: true,
      memoryKb: true,
    },
    orderBy: { testNo: 'asc' as const },
  },
} satisfies Prisma.SubmissionSelect;

// ============================================================
// ROUTER
// ============================================================

const submissionRouter = s.router(submissionContract, {
  // === CREATE SUBMISSION ===
  createSubmission: async ({
    params: { problemId },
    body: { language, sourceCode, contestId },
    headers: {
      token: { userId },
    },
  }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'STUDENT') throw new ServerError(ErrorCode.Forbidden);

    const problem = await prisma.problem.findUnique({
      where: { id: problemId, deletedAt: null },
      select: { id: true, roomId: true, status: true },
    });
    if (!problem) throw new ServerError(ErrorCode.ResourcesNotFound);

    const room = await prisma.room.findUnique({
      where: { id: problem.roomId, deletedAt: null },
      select: { status: true },
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);
    if (room.status === 'ARCHIVED') throw new ServerError(ErrorCode.RoomArchived);

    if (contestId) {
      const contest = await prisma.contest.findUnique({
        where: { id: contestId, deletedAt: null },
        select: { status: true, startAt: true, endAt: true },
      });
      if (!contest) throw new ServerError(ErrorCode.ResourcesNotFound);
      const now = new Date();
      if (contest.status !== 'PUBLISHED' || now < contest.startAt || now > contest.endAt) {
        throw new ServerError(ErrorCode.ContestNotRunning);
      }
    }

    const created = await prisma.submission.create({
      data: {
        problemId,
        roomId: problem.roomId,
        contestId: contestId ?? null,
        studentId: userId,
        language,
        sourceCode,
      },
      select: {
        id: true,
        problemId: true,
        language: true,
        judgeStatus: true,
        createdAt: true,
      },
    });

    return {
      status: 200 as const,
      body: {
        data: created,
      },
    };
  },

  // === LIST MY SUBMISSIONS ===
  listMySubmissions: async ({
    query: { query, pageIndex, pageSize, roomId, contestId, problemId, verdict },
    headers: {
      token: { userId },
    },
  }) => {
    const where: Prisma.SubmissionWhereInput = {
      studentId: userId,
      ...(roomId && { roomId }),
      ...(contestId && { contestId }),
      ...(problemId && { problemId }),
      ...(verdict && { overallVerdict: verdict }),
      ...(query && {
        problem: { title: { contains: query, mode: 'insensitive' } },
      }),
    };

    const [rawItems, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        select: submissionItemSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.submission.count({ where }),
    ]);

    const items = rawItems.map(({ student, problem, ...rest }) => ({
      ...rest,
      studentName: student.displayName,
      problemTitle: problem.title,
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

  // === GET SUBMISSION BY ID ===
  getSubmissionById: async ({ params: { submissionId } }) => {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: submissionDetailSelect,
    });
    if (!submission) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        data: submission,
      },
    };
  },

  // === LIST SUBMISSIONS IN ROOM (TEACHER) ===
  listRoomSubmissions: async ({
    params: { roomId },
    query: { query, pageIndex, pageSize, contestId, problemId, studentId, verdict },
    headers: {
      token: { userId },
    },
  }) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId, deletedAt: null },
      select: { ownerId: true },
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);
    if (room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);

    const where: Prisma.SubmissionWhereInput = {
      roomId,
      ...(contestId && { contestId }),
      ...(problemId && { problemId }),
      ...(studentId && { studentId }),
      ...(verdict && { overallVerdict: verdict }),
      ...(query && {
        OR: [
          { problem: { title: { contains: query, mode: 'insensitive' } } },
          { student: { displayName: { contains: query, mode: 'insensitive' } } },
        ],
      }),
    };

    const [rawItems, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        select: submissionItemSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.submission.count({ where }),
    ]);

    const items = rawItems.map(({ student, problem, ...rest }) => ({
      ...rest,
      studentName: student.displayName,
      problemTitle: problem.title,
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
});

// ============================================================
// EXPORT
// ============================================================

export const createSubmissionEndpoint = (app: Express) =>
  createExpressEndpoints(submissionContract, submissionRouter, app, routerDefaultOptions());
