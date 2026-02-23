import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { roomMemberContract } from '@repo/zod-schemas/src/api-contract/room-member.contract';
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

const memberUserSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
} satisfies Prisma.UserSelect;

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

// ============================================================
// ROUTER
// ============================================================

const roomMemberRouter = s.router(roomMemberContract, {
  // === LIST ROOM MEMBERS ===
  listRoomMembers: async ({ params: { roomId }, query: { query, pageIndex, pageSize } }) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId, deletedAt: null },
      select: { id: true },
    });
    if (!room) throw new ServerError(ErrorCode.ResourcesNotFound);

    const where: Prisma.RoomMemberWhereInput = {
      roomId,
      ...(query && {
        user: {
          OR: [
            { displayName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [rawMembers, total] = await Promise.all([
      prisma.roomMember.findMany({
        where,
        select: {
          user: { select: memberUserSelect },
        },
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.roomMember.count({ where }),
    ]);

    const items = rawMembers.map((m) => m.user);

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

  // === ADD MEMBERS TO ROOM ===
  addRoomMembers: async ({
    params: { roomId },
    body: { userIds },
    headers: {
      token: { userId },
    },
  }) => {
    await assertRoomOwner(roomId, userId);

    const existingMembers = await prisma.roomMember.findMany({
      where: { roomId, userId: { in: userIds } },
      select: { userId: true },
    });
    const existingIds = new Set(existingMembers.map((m) => m.userId));
    const newUserIds = userIds.filter((id) => !existingIds.has(id));

    if (newUserIds.length > 0) {
      await prisma.roomMember.createMany({
        data: newUserIds.map((uid) => ({
          roomId,
          userId: uid,
        })),
      });
    }

    return {
      status: 200 as const,
      body: {
        data: { addedCount: newUserIds.length },
      },
    };
  },

  // === REMOVE MEMBER FROM ROOM ===
  removeRoomMember: async ({
    params: { roomId, userId: targetUserId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertRoomOwner(roomId, userId);

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: targetUserId } },
    });
    if (!member) throw new ServerError(ErrorCode.ResourcesNotFound);

    await prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId: targetUserId } },
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

export const createRoomMemberEndpoint = (app: Express) =>
  createExpressEndpoints(roomMemberContract, roomMemberRouter, app, routerDefaultOptions());
