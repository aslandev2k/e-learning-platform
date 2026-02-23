import { type ZodType, z } from 'zod';
import { ERROR_DATA, ErrorCode, errorCodeZod } from './error.schema';

export const serverResponseSchema = <T extends ZodType>(
  schema: T = z.any().optional() as unknown as T,
) =>
  z.object({
    code: errorCodeZod.optional(),
    data: schema,
    message: z.string('Thông báo phải là chuỗi text').optional(),
  });

const serverInternalError = z
  .object({
    status: z.coerce.number().pipe(z.int().min(500)),
  })
  .transform(() => ({
    code: ErrorCode.InternalServerError,
    data: undefined,
    message: ERROR_DATA[ErrorCode.InternalServerError].message,
  }));

export const successResponseSchema = <T extends ZodType>(
  schema: T = z.any().optional() as unknown as T,
) =>
  z
    .object(
      {
        success: z.literal(true),
        data: schema,
      },
      'Phản hồi thành công không hợp lệ',
    )
    .describe('OK');
export type SuccessResponse<T> = z.infer<ReturnType<typeof successResponseSchema<ZodType<T>>>>;

export const errorResponseSchema = z
  .object(
    {
      success: z.literal(false),
      errorCode: errorCodeZod,
      statusCode: z.number(),
      message: z.string(),
    },
    'Phản hồi lỗi không hợp lệ',
  )
  .describe('Error Response');
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export type ClientResponse<T = any> = SuccessResponse<T> | ErrorResponse;
const successSchema = successResponseSchema();

export const clientResponseSchema = z
  .union([serverResponseSchema(), serverInternalError])
  .transform(({ code: errorCode, data, message }) => {
    if (errorCode) {
      const errorResponse = {
        ...ERROR_DATA[errorCode],
        message: message || ERROR_DATA[errorCode].message,
        success: false as const,
        errorCode,
      };
      return errorResponse;
    }
    return { success: true, data };
  })
  .pipe(z.union([successSchema, errorResponseSchema]));
