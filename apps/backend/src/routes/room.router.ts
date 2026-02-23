import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { roomContract } from '@repo/zod-schemas/src/api-contract/room.contract';
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

const roomSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.RoomSelect;

const roomItemSelect = {
  ...roomSelect,
  owner: {
    select: { displayName: true },
  },
  _count: {
    select: {
      members: true,
      contests: true,
    },
  },
} satisfies Prisma.RoomSelect;

// ============================================================
// HELPERS
// ============================================================

const assertTeacher = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== 'TEACHER') throw new ServerError(ErrorCode.Forbidden);
};

const assertRoomOwner = async (roomId: number, userId: number) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId, deletedAt: null },
    select: { ownerId: true },
  });
  if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);
  if (room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
  return room;
};

// ============================================================
// ROUTER
// ============================================================

const roomRouter = s.router(roomContract, {
  // === CREATE ROOM ===
  createRoom: async ({
    body,
    headers: {
      token: { userId },
    },
  }) => {
    await assertTeacher(userId);

    const created = await prisma.room.create({
      data: {
        ...body,
        ownerId: userId,
      },
      select: roomSelect,
    });

    return {
      status: 200 as const,
      body: {
        data: created,
      },
    };
  },

  // === LIST MY ROOMS ===
  listMyRooms: async ({
    query: { query, pageIndex, pageSize, status },
    headers: {
      token: { userId },
    },
  }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new ServerError(ErrorCode.Forbidden);

    const where: Prisma.RoomWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(query && {
        name: { contains: query, mode: 'insensitive' },
      }),
      ...(user.role === 'TEACHER' ? { ownerId: userId } : { members: { some: { userId } } }),
    };

    const [rawItems, total] = await Promise.all([
      prisma.room.findMany({
        where,
        select: roomItemSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.room.count({ where }),
    ]);

    const items = rawItems.map(({ owner, _count, ...rest }) => ({
      ...rest,
      ownerName: owner.displayName,
      memberCount: _count.members,
      contestCount: _count.contests,
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

  // === GET ROOM BY ID ===
  getRoomById: async ({ params: { roomId } }) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId, deletedAt: null },
      select: roomSelect,
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        data: room,
      },
    };
  },

  // === UPDATE ROOM ===
  updateRoom: async ({
    params: { roomId },
    body,
    headers: {
      token: { userId },
    },
  }) => {
    await assertRoomOwner(roomId, userId);

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: body,
      select: roomSelect,
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === ARCHIVE ROOM ===
  archiveRoom: async ({
    params: { roomId },
    headers: {
      token: { userId },
    },
  }) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId, deletedAt: null },
      select: { id: true, status: true, ownerId: true },
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);
    if (room.ownerId !== userId) throw new ServerError(ErrorCode.Forbidden);
    if (room.status !== 'ACTIVE') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: { status: 'ARCHIVED' },
      select: { id: true, status: true },
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === DELETE ROOM (soft delete) ===
  deleteRoom: async ({
    params: { roomId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertRoomOwner(roomId, userId);

    await prisma.room.update({
      where: { id: roomId },
      data: { deletedAt: new Date() },
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

export const createRoomEndpoint = (app: Express) =>
  createExpressEndpoints(roomContract, roomRouter, app, routerDefaultOptions());
