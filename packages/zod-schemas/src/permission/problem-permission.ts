import type { Role } from '../entity/user-schema';

type Action = 'view' | 'create' | 'edit' | 'delete';
type Resource = 'problem';
type PermissionTemplate = `${Action}:${Resource}`;

export const ALL_PROBLEM_PERMISSIONS = [
  'view:problem',
  'create:problem',
  'edit:problem',
  'delete:problem',
] as const satisfies PermissionTemplate[];

export type ProblemPermission = (typeof ALL_PROBLEM_PERMISSIONS)[number];

export const ROLE_PROBLEM_PERMISSIONS: Record<Role, ProblemPermission[]> = {
  ADMIN: ALL_PROBLEM_PERMISSIONS,
  TEACHER: ALL_PROBLEM_PERMISSIONS,
  STUDENT: ['view:problem'],
};
