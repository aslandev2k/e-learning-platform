import type { Role } from '../entity/user-schema';

type Action = 'view' | 'create';
type Resource = 'submission';
type PermissionTemplate = `${Action}:${Resource}`;

export const ALL_SUBMISSION_PERMISSIONS = [
  'view:submission',
  'create:submission',
] as const satisfies PermissionTemplate[];

export type SubmissionPermission = (typeof ALL_SUBMISSION_PERMISSIONS)[number];

export const ROLE_SUBMISSION_PERMISSIONS: Record<Role, SubmissionPermission[]> = {
  ADMIN: ALL_SUBMISSION_PERMISSIONS,
  TEACHER: ALL_SUBMISSION_PERMISSIONS,
  STUDENT: ALL_SUBMISSION_PERMISSIONS,
};
