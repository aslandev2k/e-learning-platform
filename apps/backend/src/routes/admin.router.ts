import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { adminContract } from '@repo/zod-schemas/src/api-contract/admin.contract';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import type { Express } from 'express';
import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { routerDefaultOptions } from '@/middlewares/global.middelware';
import { PasswordService } from '@/services/password.service';
import { ServerError } from '@/utils/server-error';

const s = initServer();

// ============================================================
// PRISMA SELECT — define typed select objects
// ============================================================

const userSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  status: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// ============================================================
// HELPERS
// ============================================================

const assertAdmin = async (userId: number) => {
  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!admin || admin.role !== 'ADMIN') throw new ServerError(ErrorCode.Forbidden);
};

// ============================================================
// ROUTER
// ============================================================

const adminRouter = s.router(adminContract, {
  // === LIST USERS ===
  listUsers: async ({
    query: { query, pageIndex, pageSize, role, status, sortBy, sortOrder },
    headers: {
      token: { userId },
    },
  }) => {
    await assertAdmin(userId);

    const where: Prisma.UserWhereInput = {
      ...(query && {
        OR: [
          { displayName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
      ...(status && { status }),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder ?? 'desc' }
      : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy,
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
  getUserById: async ({
    params: { userId: targetUserId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertAdmin(userId);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: userSelect,
    });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);

    return {
      status: 200 as const,
      body: {
        data: user,
      },
    };
  },

  // === LOCK USER ===
  lockUser: async ({
    params: { userId: targetUserId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertAdmin(userId);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, status: true },
    });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);
    if (user.status !== 'ACTIVE') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: 'LOCKED' },
      select: { id: true, status: true },
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === UNLOCK USER ===
  unlockUser: async ({
    params: { userId: targetUserId },
    headers: {
      token: { userId },
    },
  }) => {
    await assertAdmin(userId);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, status: true },
    });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);
    if (user.status !== 'LOCKED') throw new ServerError(ErrorCode.InvalidStatusTransition);

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: 'ACTIVE' },
      select: { id: true, status: true },
    });

    return {
      status: 200 as const,
      body: {
        data: updated,
      },
    };
  },

  // === RESET USER PASSWORD ===
  resetUserPassword: async ({
    params: { userId: targetUserId },
    body: { newPassword },
    headers: {
      token: { userId },
    },
  }) => {
    await assertAdmin(userId);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!user) throw new ServerError(ErrorCode.ResourcesNotFound);

    const passwordHash = await PasswordService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash },
    });

    return {
      status: 200 as const,
      body: {
        data: { message: 'Đặt lại mật khẩu thành công' },
      },
    };
  },
});

// ============================================================
// EXPORT
// ============================================================

export const createAdminEndpoint = (app: Express) =>
  createExpressEndpoints(adminContract, adminRouter, app, routerDefaultOptions());
