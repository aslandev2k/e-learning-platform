import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod, searchOptionsSchema, searchResultsSchema } from '../common';
import { roomItemSchema, roomSchema, roomStatusZod } from '../entity/room-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const roomContract = c.router({
  // === CREATE ROOM ===
  createRoom: {
    summary: 'Create room',
    description: 'Create a new room (TEACHER only)',
    method: 'POST',
    path: '/api/v1/rooms',
    headers: jwtAuthHeaderSchema,
    body: z.object({
      name: roomSchema.shape.name,
      description: roomSchema.shape.description.optional(),
    }),
    responses: {
      200: serverResponseSchema(roomSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden),
  },

  // === LIST MY ROOMS ===
  listMyRooms: {
    summary: 'List my rooms',
    description: 'List rooms owned by current teacher or rooms where student is member',
    method: 'GET',
    path: '/api/v1/rooms',
    headers: jwtAuthHeaderSchema,
    query: searchOptionsSchema.extend({
      status: roomStatusZod.optional().catch(undefined),
    }),
    responses: {
      200: serverResponseSchema(searchResultsSchema(roomItemSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden),
  },

  // === GET ROOM BY ID ===
  getRoomById: {
    summary: 'Get room by id',
    description: 'Get detailed room information by id',
    method: 'GET',
    path: '/api/v1/rooms/:roomId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(roomSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === UPDATE ROOM ===
  updateRoom: {
    summary: 'Update room',
    description: 'Update room information (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/rooms/:roomId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    body: z.object({
      name: roomSchema.shape.name,
      description: roomSchema.shape.description.optional(),
    }),
    responses: {
      200: serverResponseSchema(roomSchema),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },

  // === ARCHIVE ROOM ===
  archiveRoom: {
    summary: 'Archive room',
    description: 'Archive a room (TEACHER owner only)',
    method: 'PUT',
    path: '/api/v1/rooms/:roomId/archive',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(roomSchema.pick({ id: true, status: true })),
    },
    metadata: OpenAPIHelper.generateErrorCodes(
      ErrorCode.Forbidden,
      ErrorCode.ResourcesNotFound,
      ErrorCode.InvalidStatusTransition,
    ),
  },

  // === DELETE ROOM (soft delete) ===
  deleteRoom: {
    summary: 'Delete room',
    description: 'Soft delete a room (TEACHER owner only)',
    method: 'DELETE',
    path: '/api/v1/rooms/:roomId',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      roomId: commonZod.pathId,
    }),
    body: c.noBody(),
    responses: {
      200: serverResponseSchema(z.undefined()),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(roomContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
