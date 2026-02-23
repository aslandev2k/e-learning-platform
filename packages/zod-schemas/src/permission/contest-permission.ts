import type { Role } from '../entity/user-schema';

type Action = 'view' | 'create' | 'edit' | 'delete';
type Resource = 'contest';
type PermissionTemplate = `${Action}:${Resource}`;

export const ALL_CONTEST_PERMISSIONS = [
  'view:contest',
  'create:contest',
  'edit:contest',
  'delete:contest',
] as const satisfies PermissionTemplate[];

export type ContestPermission = (typeof ALL_CONTEST_PERMISSIONS)[number];

export const ROLE_CONTEST_PERMISSIONS: Record<Role, ContestPermission[]> = {
  ADMIN: ALL_CONTEST_PERMISSIONS,
  TEACHER: ALL_CONTEST_PERMISSIONS,
  STUDENT: ['view:contest'],
};
