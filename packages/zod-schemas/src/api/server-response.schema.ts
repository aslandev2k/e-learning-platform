import z from 'zod';
import { errorCodeZod } from './error.schema';

export const serverSuccessResponse = z.object({
  success: z.literal(true).catch(true),
  data: z.any().optional(),
});
export const serverErrorResponse = z.object({
  success: z.literal(false).catch(false),
  message: z.string().nonempty(),
  code: errorCodeZod,
  errorFields: z.array(z.object({ name: z.string(), message: z.string() })).default([]),
});
export const serverResponse = z.union([serverErrorResponse, serverSuccessResponse]);

export type ServerResponse = z.infer<typeof serverResponse>;
export type ServerErrorResponse = z.infer<typeof serverErrorResponse>;
