import z from 'zod';
import { commonZod } from '../common';
import { problemSchema } from './problem-schema';
import { userSchema } from './user-schema';

// ─── Main Entity Schema ─────────────────────────────────────────────

export const contestScoreSchema = z
  .object({
    id: commonZod.entityId,
    contestId: commonZod.entityId,
    problemId: commonZod.entityId,
    studentId: commonZod.entityId,
    bestScore: z
      .number()
      .min(0, 'Điểm không được âm')
      .meta({ examples: [100, 75.5, 0] }),
    lastSubmissionAt: commonZod.datetime.nullable(),
  })
  .meta({
    title: 'ContestScore',
    description: 'Điểm cao nhất của học sinh cho từng bài trong kỳ thi',
  });

export type ContestScore = z.infer<typeof contestScoreSchema>;

// ─── List Item Schema (for leaderboard/scoreboard display) ───────────

export const contestScoreItemSchema = contestScoreSchema.extend({
  studentName: userSchema.shape.displayName,
  problemTitle: problemSchema.shape.title,
  submissionCount: z
    .int()
    .min(0)
    .meta({ examples: [3, 7] }),
});
export type ContestScoreItem = z.infer<typeof contestScoreItemSchema>;

// ─── Scoreboard Row (aggregated per student across all problems) ─────

export const contestScoreboardRowSchema = z
  .object({
    studentId: commonZod.entityId,
    studentName: userSchema.shape.displayName,
    totalScore: z
      .number()
      .min(0)
      .meta({ examples: [350, 200, 0] }),
    scores: z.array(
      z.object({
        problemId: commonZod.entityId,
        problemTitle: problemSchema.shape.title,
        bestScore: z
          .number()
          .min(0)
          .meta({ examples: [100, 50, 0] }),
        lastSubmissionAt: commonZod.datetime.nullable(),
      }),
    ),
  })
  .meta({ title: 'ContestScoreboardRow', description: 'Hàng bảng điểm kỳ thi' });

export type ContestScoreboardRow = z.infer<typeof contestScoreboardRowSchema>;
