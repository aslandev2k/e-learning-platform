import { Role } from '@repo/zod-schemas/src/entity/user-schema';
import type { CurrentUserDTO } from '@/repositories/currentUser.repository';

export const isAdmin = (currentUser: CurrentUserDTO) => currentUser.role === Role.ADMIN;

export const isTeacher = (currentUser: CurrentUserDTO) => currentUser.role === Role.TEACHER;

export const isStudent = (currentUser: CurrentUserDTO) => currentUser.role === Role.STUDENT;
