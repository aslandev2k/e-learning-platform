import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { userContract } from '@repo/zod-schemas/src/api-contract/user.contract';
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

const userSearchSelect = {
  id: true,
  email: true,
  displayName: true,
} satisfies Prisma.UserSelect;

// ============================================================
// ROUTER
// ============================================================

const userRouter = s.router(userContract, {
  // === SEARCH USERS ===
  searchUsers: async ({ query: { query, pageIndex, pageSize } }) => {
    const where: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      role: 'STUDENT',
      ...(query && {
        OR: [
          { displayName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSearchSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { displayName: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

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

  // === GET USER BY ID ===
  getUserById: async ({ params: { userId } }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSearchSelect,
    });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        data: user,
      },
    };
  },
});

// ============================================================
// EXPORT
// ============================================================

export const createUserEndpoint = (app: Express) =>
  createExpressEndpoints(userContract, userRouter, app, routerDefaultOptions());
