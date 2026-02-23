import type { Role } from '../entity/user-schema';

type Action = 'view' | 'create' | 'edit' | 'delete';
type Resource = 'room';
type PermissionTemplate = `${Action}:${Resource}`;

export const ALL_ROOM_PERMISSIONS = [
  'view:room',
  'create:room',
  'edit:room',
  'delete:room',
] as const satisfies PermissionTemplate[];

export type RoomPermission = (typeof ALL_ROOM_PERMISSIONS)[number];

export const ROLE_ROOM_PERMISSIONS: Record<Role, RoomPermission[]> = {
  ADMIN: ALL_ROOM_PERMISSIONS,
  TEACHER: ['view:room', 'create:room', 'edit:room', 'delete:room'],
  STUDENT: ['view:room'],
};
