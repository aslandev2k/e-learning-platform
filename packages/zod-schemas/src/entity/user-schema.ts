import z from 'zod';
import { commonZod } from '../common';

// ─── Enums ──────────────────────────────────────────────────────────

export const Role = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const roleZod = z.enum(['ADMIN', 'TEACHER', 'STUDENT']);

export const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: 'Quản trị viên',
  [Role.TEACHER]: 'Giáo viên',
  [Role.STUDENT]: 'Học sinh',
};

export const ROLE_OPTIONS = Object.values(Role).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

export const AccountStatus = {
  PENDING_EMAIL_VERIFY: 'PENDING_EMAIL_VERIFY',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const accountStatusZod = z.enum(['PENDING_EMAIL_VERIFY', 'ACTIVE', 'LOCKED']);

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  [AccountStatus.PENDING_EMAIL_VERIFY]: 'Chờ xác thực email',
  [AccountStatus.ACTIVE]: 'Hoạt động',
  [AccountStatus.LOCKED]: 'Đã khóa',
};

export const ACCOUNT_STATUS_OPTIONS = Object.values(AccountStatus).map((s) => ({
  value: s,
  label: ACCOUNT_STATUS_LABEL[s],
}));

// ─── Main Entity Schema ─────────────────────────────────────────────

export const userSchema = z
  .object({
    id: commonZod.entityId,
    email: commonZod.email,
    displayName: z
      .string('Vui lòng nhập tên hiển thị')
      .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
      .max(100, 'Tên hiển thị quá dài, tối đa 100 ký tự')
      .meta({ examples: ['Nguyễn Văn An', 'GV Trần Thị Bình'] }),
    role: roleZod,
    status: accountStatusZod,
    emailVerified: z.boolean(),
    createdAt: commonZod.datetime,
    updatedAt: commonZod.datetime,
  })
  .meta({ title: 'User', description: 'Người dùng' });

export type User = z.infer<typeof userSchema>;

// ─── List Item Schema ────────────────────────────────────────────────

export const userItemSchema = userSchema;
export type UserItem = z.infer<typeof userItemSchema>;

// ─── Detail Schema ───────────────────────────────────────────────────

export const userDetailSchema = userSchema;
export type UserDetail = z.infer<typeof userDetailSchema>;
