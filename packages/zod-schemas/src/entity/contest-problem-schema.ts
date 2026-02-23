import z from 'zod';
import { commonZod } from '../common';
import { problemSchema } from './problem-schema';

// ─── Main Entity Schema ─────────────────────────────────────────────

export const contestProblemSchema = z
  .object({
    id: commonZod.entityId,
    contestId: commonZod.entityId,
    problemId: commonZod.entityId,
    maxScore: z
      .number()
      .positive('Điểm tối đa phải là số dương')
      .max(1000, 'Điểm tối đa không được vượt quá 1000')
      .meta({ examples: [100, 50, 25] }),
    order: z
      .int()
      .min(1, 'Thứ tự bài toán phải từ 1 trở lên')
      .meta({ examples: [1, 2, 3] }),
  })
  .meta({ title: 'ContestProblem', description: 'Bài toán trong kỳ thi' });

export type ContestProblem = z.infer<typeof contestProblemSchema>;

// ─── List Item Schema (with problem info for display) ────────────────

export const contestProblemItemSchema = contestProblemSchema.extend({
  problemTitle: problemSchema.shape.title,
  problemStatus: problemSchema.shape.status,
  timeLimitMs: problemSchema.shape.timeLimitMs,
  memoryLimitKb: problemSchema.shape.memoryLimitKb,
});
export type ContestProblemItem = z.infer<typeof contestProblemItemSchema>;
