import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import type { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import type { $ZodIssue } from 'zod/v4/core';
import { logger } from '@/utils/logger';
import { ServerError } from '@/utils/server-error';
import { zodErrorHandler } from './requestValidationErrorHandler';

const errorSchema = z.object({
  cause: z.unknown().optional(),
  message: z.string(),
  name: z.string(),
  stack: z.string().optional().default(''),
});

const sensitiveDataZod = z
  .any()
  .transform(() => '***')
  .optional();

function maskFields(data: unknown) {
  return z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.any()),
      z.looseObject({
        password: sensitiveDataZod,
        token: sensitiveDataZod,
        refreshToken: sensitiveDataZod,
      }),
      z.any(),
    ])
    .catch(undefined)
    .parse(data);
}

export const asyncHandler =
  (fn: <T>(req: Request, res: Response, next?: NextFunction) => Promise<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const errorHandler = async <E extends Error & { cause: any }>(
  err: E,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (res.headersSent) return;

  if (err instanceof ZodError) {
    zodErrorHandler(err.issues as $ZodIssue[], req, res, next, 'response');
    return;
  }

  if (err.name === 'SyntaxError') {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON syntax',
    });
    return;
  }

  if (err instanceof ServerError) {
    res.status(err.statusCode).json(err.toResponse());
    return;
  }

  const internalError = new ServerError(ErrorCode.InternalServerError);
  res.status(internalError.statusCode).json(internalError.toResponse());

  const checkError = errorSchema.safeParse(err);
  if (checkError.success) {
    const { message, name, cause, stack } = checkError.data;
    logger.error(`UNCAUGHT_ERROR: ${req.method.toUpperCase()} ${req.path}`, {
      reqBody: maskFields(req.body),
      message,
      name,
      stack: stack.split('\n').slice(0, 2).join(' '),
      cause,
    });
  } else {
    logger.error(`ERROR_HANDLE_FAILED: ${req.method.toUpperCase()} ${req.path}`, {
      reqBody: maskFields(req.body),
      errorName: err.name || err?.cause?.name,
      errorMessage: err.message,
      cause: err.cause,
    });
  }
};
