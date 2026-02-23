import z from 'zod';
import { SCHEMA_DESCRIPTION, commonZod } from '../common';

// ─── Enums ──────────────────────────────────────────────────────────

export const ProblemStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type ProblemStatus = (typeof ProblemStatus)[keyof typeof ProblemStatus];

export const problemStatusZod = z.enum(['DRAFT', 'PUBLISHED']);

export const PROBLEM_STATUS_LABEL: Record<ProblemStatus, string> = {
  [ProblemStatus.DRAFT]: 'Nháp',
  [ProblemStatus.PUBLISHED]: 'Đã công bố',
};

export const PROBLEM_STATUS_OPTIONS = Object.values(ProblemStatus).map((s) => ({
  value: s,
  label: PROBLEM_STATUS_LABEL[s],
}));

// ─── Main Entity Schema ─────────────────────────────────────────────

export const problemSchema = z
  .object({
    id: commonZod.entityId,
    title: z
      .string('Vui lòng nhập tiêu đề bài toán')
      .min(2, 'Tiêu đề phải có ít nhất 2 ký tự')
      .max(200, 'Tiêu đề quá dài, tối đa 200 ký tự')
      .meta({ examples: ['Tổng hai số', 'Đường đi ngắn nhất trong đồ thị'] }),
    statement: z
      .string('Vui lòng nhập đề bài')
      .min(10, 'Đề bài phải có ít nhất 10 ký tự')
      .meta({ examples: ['Cho hai số nguyên a, b. Hãy tính tổng a + b.'] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    inputSpec: z
      .string('Vui lòng nhập định dạng đầu vào')
      .nullable()
      .meta({ examples: ['Dòng đầu tiên gồm hai số nguyên a và b (1 ≤ a, b ≤ 10^9).', null] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    outputSpec: z
      .string('Vui lòng nhập định dạng đầu ra')
      .nullable()
      .meta({ examples: ['In ra tổng a + b.', null] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    constraints: z
      .string('Vui lòng nhập ràng buộc')
      .nullable()
      .meta({ examples: ['1 ≤ a, b ≤ 10^9. Thời gian: 1s. Bộ nhớ: 256MB.', null] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    timeLimitMs: z
      .int()
      .min(100, 'Giới hạn thời gian tối thiểu là 100ms')
      .max(10000, 'Giới hạn thời gian tối đa là 10000ms')
      .meta({ examples: [1000, 2000] }),
    memoryLimitKb: z
      .int()
      .min(1024, 'Giới hạn bộ nhớ tối thiểu là 1024 KB')
      .max(524288, 'Giới hạn bộ nhớ tối đa là 524288 KB (512 MB)')
      .meta({ examples: [262144, 524288] }),
    status: problemStatusZod,
    roomId: commonZod.entityId,
    createdAt: commonZod.datetime,
    updatedAt: commonZod.datetime,
    deletedAt: commonZod.datetime.nullable(),
  })
  .meta({ title: 'Problem', description: 'Bài toán lập trình' });

export type Problem = z.infer<typeof problemSchema>;

// ─── List Item Schema ────────────────────────────────────────────────

export const problemItemSchema = problemSchema.extend({
  roomName: z
    .string()
    .nonempty()
    .meta({ examples: ['Lớp 10A1 - Lập trình cơ bản'] }),
  testCaseCount: z
    .int()
    .min(0)
    .meta({ examples: [10, 20] }),
});
export type ProblemItem = z.infer<typeof problemItemSchema>;

// ─── Detail Schema ───────────────────────────────────────────────────

export const problemDetailSchema = problemSchema;
export type ProblemDetail = z.infer<typeof problemDetailSchema>;
