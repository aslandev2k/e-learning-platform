import z from 'zod';
import { commonZod } from '../common';

// ─── Enums ──────────────────────────────────────────────────────────

export const RoomStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const roomStatusZod = z.enum(['ACTIVE', 'ARCHIVED']);

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  [RoomStatus.ACTIVE]: 'Đang hoạt động',
  [RoomStatus.ARCHIVED]: 'Đã lưu trữ',
};

export const ROOM_STATUS_OPTIONS = Object.values(RoomStatus).map((s) => ({
  value: s,
  label: ROOM_STATUS_LABEL[s],
}));

// ─── Main Entity Schema ─────────────────────────────────────────────

export const roomSchema = z
  .object({
    id: commonZod.entityId,
    name: z
      .string('Vui lòng nhập tên phòng')
      .min(2, 'Tên phòng phải có ít nhất 2 ký tự')
      .max(128, 'Tên phòng quá dài, tối đa 128 ký tự')
      .meta({ examples: ['Lớp 10A1 - Lập trình cơ bản', 'Thi thử Olympic Tin học 2025'] }),
    description: z
      .string('Vui lòng nhập mô tả phòng')
      .max(500, 'Mô tả quá dài, tối đa 500 ký tự')
      .nullable()
      .meta({ examples: ['Phòng học lập trình dành cho học sinh lớp 10', null] }),
    status: roomStatusZod,
    ownerId: commonZod.entityId,
    createdAt: commonZod.datetime,
    updatedAt: commonZod.datetime,
    deletedAt: commonZod.datetime.nullable(),
  })
  .meta({ title: 'Room', description: 'Phòng học / lớp học' });

export type Room = z.infer<typeof roomSchema>;

// ─── List Item Schema ────────────────────────────────────────────────

export const roomItemSchema = roomSchema.extend({
  ownerName: z
    .string('Vui lòng nhập tên giáo viên phụ trách')
    .nonempty('Vui lòng nhập tên giáo viên phụ trách')
    .meta({ examples: ['GV Nguyễn Văn An'] }),
  memberCount: z
    .int()
    .min(0)
    .meta({ examples: [15, 30] }),
  contestCount: z
    .int()
    .min(0)
    .meta({ examples: [3, 10] }),
});
export type RoomItem = z.infer<typeof roomItemSchema>;

// ─── Detail Schema ───────────────────────────────────────────────────

export const roomDetailSchema = roomSchema;
export type RoomDetail = z.infer<typeof roomDetailSchema>;
