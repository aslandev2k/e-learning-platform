import z from 'zod';
import { SCHEMA_DESCRIPTION, commonZod } from '../common';

// ─── Main Entity Schema ─────────────────────────────────────────────

export const testCaseSchema = z
  .object({
    id: commonZod.entityId,
    problemId: commonZod.entityId,
    testNo: z
      .int()
      .min(1, 'Số thứ tự test case phải từ 1 trở lên')
      .meta({ examples: [1, 2, 10] }),
    input: z
      .string('Vui lòng nhập dữ liệu đầu vào')
      .min(1, 'Dữ liệu đầu vào không được để trống')
      .meta({ examples: ['3 5', '1\n2\n3'] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    expectedOutput: z
      .string('Vui lòng nhập kết quả mong đợi')
      .min(1, 'Kết quả mong đợi không được để trống')
      .meta({ examples: ['8', '6'] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    createdAt: commonZod.datetime,
  })
  .meta({ title: 'TestCase', description: 'Test case của bài toán' });

export type TestCase = z.infer<typeof testCaseSchema>;

// ─── List Item Schema ────────────────────────────────────────────────

export const testCaseItemSchema = testCaseSchema;
export type TestCaseItem = z.infer<typeof testCaseItemSchema>;
