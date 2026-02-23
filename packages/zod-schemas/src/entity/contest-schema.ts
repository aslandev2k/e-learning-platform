import z from 'zod';
import { commonZod } from '../common';

// ─── Enums ──────────────────────────────────────────────────────────

export const ContestStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type ContestStatus = (typeof ContestStatus)[keyof typeof ContestStatus];

export const contestStatusZod = z.enum(['DRAFT', 'PUBLISHED']);

export const CONTEST_STATUS_LABEL: Record<ContestStatus, string> = {
  [ContestStatus.DRAFT]: 'Nháp',
  [ContestStatus.PUBLISHED]: 'Đã công bố',
};

export const CONTEST_STATUS_OPTIONS = Object.values(ContestStatus).map((s) => ({
  value: s,
  label: CONTEST_STATUS_LABEL[s],
}));

// ─── Main Entity Schema ─────────────────────────────────────────────

export const contestSchema = z
  .object({
    id: commonZod.entityId,
    name: z
      .string('Vui lòng nhập tên kỳ thi')
      .min(2, 'Tên kỳ thi phải có ít nhất 2 ký tự')
      .max(200, 'Tên kỳ thi quá dài, tối đa 200 ký tự')
      .meta({ examples: ['Kỳ thi Lập trình Tháng 3/2025', 'Olympic Tin học Vòng Loại'] }),
    startAt: commonZod.datetime,
    endAt: commonZod.datetime,
    status: contestStatusZod,
    roomId: commonZod.entityId,
    createdAt: commonZod.datetime,
    updatedAt: commonZod.datetime,
    deletedAt: commonZod.datetime.nullable(),
  })
  .meta({ title: 'Contest', description: 'Kỳ thi / cuộc thi lập trình' });

export type Contest = z.infer<typeof contestSchema>;

// ─── List Item Schema ────────────────────────────────────────────────

export const contestItemSchema = contestSchema.extend({
  roomName: z
    .string()
    .nonempty()
    .meta({ examples: ['Lớp 10A1 - Lập trình cơ bản'] }),
  problemCount: z
    .int()
    .min(0)
    .meta({ examples: [5, 10] }),
  participantCount: z
    .int()
    .min(0)
    .meta({ examples: [20, 35] }),
});
export type ContestItem = z.infer<typeof contestItemSchema>;

// ─── Detail Schema ───────────────────────────────────────────────────

export const contestDetailSchema = contestSchema;
export type ContestDetail = z.infer<typeof contestDetailSchema>;
