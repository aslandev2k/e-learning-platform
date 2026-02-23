import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { contestContract } from '@repo/zod-schemas/src/api-contract/contest.contract';
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

const contestSelect = {
  id: true,
  name: true,
  startAt: true,
  endAt: true,
  status: true,
  roomId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ContestSelect;

const contestItemSelect = {
  ...contestSelect,
  room: {
    select: { name: true },
  },
  _count: {
    select: {
      problems: true,
      scores: {
        where: {},
      },
    },
  },
} satisfies Prisma.ContestSelect;

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

const assertContestOwner = async (contestId: number, userId: number) => {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId, deletedAt: null },
    select: { id: true, status: true, room: { select: { ownerId: true } } },
  });
  if (!contest) throw new ServerError(ErrorCode.ResourcesNotFound);
  if (contest.room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
  return contest;
};

const getParticipantCount = async (contestId: number) => {
  const count = await prisma.contestScore.groupBy({
    by: ['studentId'],
    where: { contestId },
  });
  return count.length;
};

// ============================================================
// ROUTER
// ============================================================

const contestRouter = s.router(contestContract, {
  // === CREATE CONTEST ===
  createContest: async ({
    params: { roomId },
    body,
    headers: {
      token: { userId },
    },
  }) => {
    await assertRoomOwner(roomId, userId);

    const created = await prisma.contest.create({
      data: {
        ...body,
        roomId,
      },
      select: contestSelect,
    });

    return {
      status: 200 as const,
      body: {
        data: created,
      },
    };
  },

  // === LIST CONTESTS IN ROOM ===
  listContests: async ({ params: { roomId }, query: { query, pageIndex, pageSize, status } }) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId, deletedAt: null },
      select: { id: true },
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);

    const where: Prisma.ContestWhereInput = {
      roomId,
      deletedAt: null,
      ...(status && { status }),
      ...(query && {
        name: { contains: query, mode: 'insensitive' },
      }),
    };

    const [rawItems, total] = await Promise.all([
      prisma.contest.findMany({
        where,
        select: contestItemSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contest.count({ where }),
    ]);

    const items = await Promise.all(
      rawItems.map(async ({ room: r, _count, ...rest }) => ({
        ...rest,
        roomName: r.name,
        problemCount: _count.problems,
        participantCount: await getParticipantCount(rest.id),
      })),
    );

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

  // === GET CONTEST BY ID ===
  getContestById: async ({ params: { contestId } }) => {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId, deletedAt: null },
      select: contestSelect,
    });
    if (!contest) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        data: contest,
      },
    };
  },

  // === UPDATE CONTEST ===
  updateContest: async ({
    params: { contestId },
    body,
    headers: {
      token: { userId },
    },
  }) => {
    await assertContestOwner(contestId, userId);

    const updated = await prisma.contest.update({
      where: { id: contestId },
      data: body,
      select: contestSelect,
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === DELETE CONTEST (soft delete) ===
  deleteContest: async ({
    params: { contestId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertContestOwner(contestId, userId);

    await prisma.contest.update({
      where: { id: contestId },
      data: { deletedAt: new Date() },
    });

    return {
      status: 200 as const,
      body: {
        data: undefined,
      },
    };
  },

  // === PUBLISH CONTEST ===
  publishContest: async ({
    params: { contestId },
    headers: {
      token: { userId },
    },
  }) => {
    const contest = await assertContestOwner(contestId, userId);
    if (contest.status !== 'DRAFT') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.contest.update({
      where: { id: contestId },
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

  // === UNPUBLISH CONTEST ===
  unpublishContest: async ({
    params: { contestId },
    headers: {
      token: { userId },
    },
  }) => {
    const contest = await assertContestOwner(contestId, userId);
    if (contest.status !== 'PUBLISHED') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.contest.update({
      where: { id: contestId },
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

export const createContestEndpoint = (app: Express) =>
  createExpressEndpoints(contestContract, contestRouter, app, routerDefaultOptions());
