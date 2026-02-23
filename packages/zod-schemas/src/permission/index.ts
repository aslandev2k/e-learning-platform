import type { Role } from '../entity/user-schema';
import { type ContestPermission, ROLE_CONTEST_PERMISSIONS } from './contest-permission';
import { type ProblemPermission, ROLE_PROBLEM_PERMISSIONS } from './problem-permission';
import { ROLE_ROOM_PERMISSIONS, type RoomPermission } from './room-permission';
import { ROLE_SUBMISSION_PERMISSIONS, type SubmissionPermission } from './submission-permission';

// Re-export all permissions
export * from './contest-permission';
export * from './problem-permission';
export * from './room-permission';
export * from './submission-permission';

// Combined Permission Type
export type Permission =
  | RoomPermission
  | ContestPermission
  | ProblemPermission
  | SubmissionPermission;

// Helper function to get all permissions for a role
export const roleToPermissions = (role: Role): Set<Permission> => {
  const permissions = [
    ROLE_ROOM_PERMISSIONS,
    ROLE_CONTEST_PERMISSIONS,
    ROLE_PROBLEM_PERMISSIONS,
    ROLE_SUBMISSION_PERMISSIONS,
  ].flatMap((permissionMap) => permissionMap[role]);

  return new Set(permissions);
};
