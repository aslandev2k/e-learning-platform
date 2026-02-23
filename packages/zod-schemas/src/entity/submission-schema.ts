import z from 'zod';
import { SCHEMA_DESCRIPTION, commonZod } from '../common';

// ─── Enums ──────────────────────────────────────────────────────────

export const Language = {
  CPP: 'CPP',
  PY: 'PY',
} as const;
export type Language = (typeof Language)[keyof typeof Language];

export const languageZod = z.enum(['CPP', 'PY']);

export const LANGUAGE_LABEL: Record<Language, string> = {
  [Language.CPP]: 'C++',
  [Language.PY]: 'Python',
};

export const LANGUAGE_OPTIONS = Object.values(Language).map((l) => ({
  value: l,
  label: LANGUAGE_LABEL[l],
}));

export const JudgeStatus = {
  QUEUED: 'QUEUED',
  JUDGING: 'JUDGING',
  DONE: 'DONE',
  FAILED_SYSTEM: 'FAILED_SYSTEM',
} as const;
export type JudgeStatus = (typeof JudgeStatus)[keyof typeof JudgeStatus];

export const judgeStatusZod = z.enum(['QUEUED', 'JUDGING', 'DONE', 'FAILED_SYSTEM']);

export const JUDGE_STATUS_LABEL: Record<JudgeStatus, string> = {
  [JudgeStatus.QUEUED]: 'Đang chờ chấm',
  [JudgeStatus.JUDGING]: 'Đang chấm',
  [JudgeStatus.DONE]: 'Đã chấm xong',
  [JudgeStatus.FAILED_SYSTEM]: 'Lỗi hệ thống',
};

export const JUDGE_STATUS_OPTIONS = Object.values(JudgeStatus).map((s) => ({
  value: s,
  label: JUDGE_STATUS_LABEL[s],
}));

export const OverallVerdict = {
  AC: 'AC',
  WA: 'WA',
  RE: 'RE',
  TLE: 'TLE',
  CE: 'CE',
} as const;
export type OverallVerdict = (typeof OverallVerdict)[keyof typeof OverallVerdict];

export const overallVerdictZod = z.enum(['AC', 'WA', 'RE', 'TLE', 'CE']);

export const OVERALL_VERDICT_LABEL: Record<OverallVerdict, string> = {
  [OverallVerdict.AC]: 'Accepted - Kết quả đúng',
  [OverallVerdict.WA]: 'Wrong Answer - Kết quả sai',
  [OverallVerdict.RE]: 'Runtime Error - Lỗi chạy',
  [OverallVerdict.TLE]: 'Time Limit Exceeded - Quá thời gian',
  [OverallVerdict.CE]: 'Compile Error - Lỗi biên dịch',
};

export const OVERALL_VERDICT_OPTIONS = Object.values(OverallVerdict).map((v) => ({
  value: v,
  label: OVERALL_VERDICT_LABEL[v],
}));

export const TestVerdict = {
  AC: 'AC',
  WA: 'WA',
  RE: 'RE',
  TLE: 'TLE',
} as const;
export type TestVerdict = (typeof TestVerdict)[keyof typeof TestVerdict];

export const testVerdictZod = z.enum(['AC', 'WA', 'RE', 'TLE']);

export const TEST_VERDICT_LABEL: Record<TestVerdict, string> = {
  [TestVerdict.AC]: 'Accepted',
  [TestVerdict.WA]: 'Wrong Answer',
  [TestVerdict.RE]: 'Runtime Error',
  [TestVerdict.TLE]: 'Time Limit Exceeded',
};

export const TEST_VERDICT_OPTIONS = Object.values(TestVerdict).map((v) => ({
  value: v,
  label: TEST_VERDICT_LABEL[v],
}));

// ─── Submission Test Result ──────────────────────────────────────────

export const submissionTestResultSchema = z
  .object({
    id: commonZod.entityId,
    submissionId: commonZod.entityId,
    testNo: z
      .int()
      .min(1)
      .meta({ examples: [1, 2, 10] }),
    verdict: testVerdictZod,
    timeMs: z
      .int()
      .min(0)
      .meta({ examples: [50, 120, 999] }),
    memoryKb: z
      .int()
      .min(0)
      .nullable()
      .meta({ examples: [1024, 4096, null] }),
  })
  .meta({ title: 'SubmissionTestResult', description: 'Kết quả chấm điểm từng test case' });

export type SubmissionTestResult = z.infer<typeof submissionTestResultSchema>;

// ─── Main Entity Schema ─────────────────────────────────────────────

export const submissionSchema = z
  .object({
    id: commonZod.entityId,
    problemId: commonZod.entityId,
    roomId: commonZod.entityId,
    contestId: commonZod.entityId.nullable(),
    studentId: commonZod.entityId,
    language: languageZod,
    sourceCode: z
      .string('Vui lòng nhập mã nguồn')
      .min(1, 'Mã nguồn không được để trống')
      .meta({ examples: ['#include <bits/stdc++.h>\nusing namespace std;\nint main() { }'] })
      .describe(SCHEMA_DESCRIPTION.TEXTAREA),
    judgeStatus: judgeStatusZod,
    overallVerdict: overallVerdictZod.nullable(),
    totalTimeMs: z
      .int()
      .min(0)
      .nullable()
      .meta({ examples: [350, 1200, null] }),
    compileLog: z
      .string()
      .nullable()
      .describe(SCHEMA_DESCRIPTION.TEXTAREA)
      .meta({ examples: ["error: expected ';' before return", null] }),
    passedTests: z
      .int()
      .min(0)
      .nullable()
      .meta({ examples: [8, 10, null] }),
    totalTests: z
      .int()
      .min(0)
      .nullable()
      .meta({ examples: [10, null] }),
    createdAt: commonZod.datetime,
    judgedAt: commonZod.datetime.nullable(),
  })
  .meta({ title: 'Submission', description: 'Bài nộp của học sinh' });

export type Submission = z.infer<typeof submissionSchema>;

// ─── List Item Schema ────────────────────────────────────────────────

export const submissionItemSchema = submissionSchema.extend({
  studentName: z
    .string()
    .nonempty()
    .meta({ examples: ['Nguyễn Văn An'] }),
  problemTitle: z
    .string()
    .nonempty()
    .meta({ examples: ['Tổng hai số'] }),
});
export type SubmissionItem = z.infer<typeof submissionItemSchema>;

// ─── Detail Schema (with test results) ───────────────────────────────

export const submissionDetailSchema = submissionSchema.extend({
  testResults: z.array(submissionTestResultSchema),
});
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;
