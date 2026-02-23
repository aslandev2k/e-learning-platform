import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import { userSchema } from '../entity/user-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

const roomMemberItemSchema = userSchema.pick({
  id: true,
  email: true,
  displayName: true,
  role: true,
});

export const roomMemberContract = c.router({
  // === LIST ROOM MEMBERS ===
  listRoomMembers: {
    summary: 'List room members',
    description: 'List all members of a room',
    method: 'GET',
    path: '/api/v1/rooms/:roomId/members',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    query: searchOptionsSchema,
    responses: {
      200: serverResponseSchema(searchResultsSchema(roomMemberItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === ADD MEMBERS TO ROOM ===
  addRoomMembers: {
    summary: 'Add members to room',
    description: 'Add one or more students to a room (TEACHER owner only)',
    method: 'POST',
    path: '/api/v1/rooms/:roomId/members',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    body: z.object({
      userIds: z.array(commonZod.entityId).min(1, 'Vui lòng chọn ít nhất 1 học sinh'),
    }),
    responses: {
      200: serverResponseSchema(
        z.object({
          addedCount: z.int().min(0),
        }),
      ),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.DuplicateEntry,
    ),
  },

  // === REMOVE MEMBER FROM ROOM ===
  removeRoomMember: {
    summary: 'Remove member from room',
    description: 'Remove a student from a room (TEACHER owner only)',
    method: 'DELETE',
    path: '/api/v1/rooms/:roomId/members/:userId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
      userId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(z.undefined()),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(roomMemberContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
