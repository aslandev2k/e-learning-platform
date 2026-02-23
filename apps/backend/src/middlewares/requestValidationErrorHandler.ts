import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import type { ServerErrorResponse } from '@repo/zod-schemas/src/api/server-response.schema';
import type { RequestValidationError } from '@ts-rest/express';
import type { NextFunction, Request, Response } from 'express';
import z from 'zod';
import type { $ZodIssue } from 'zod/v4/core';
import { logger } from '@/utils/logger';
import { ServerError } from '@/utils/server-error';

type Issue = Pick<$ZodIssue, 'message' | 'path'> & {
  code: string;
  received?: any;
};

const issueSchema = z.object({
  path: z.array(z.coerce.string()),
  message: z.string(),
  code: z.string(),
  received: z.any().optional(),
});

const zodErrorSchema = z
  .object({
    name: z.literal('ValidationError'),
    issues: z.array(issueSchema),
  })
  .passthrough();

const routeZodSchema = z.object({
  pathParams: zodErrorSchema.nullable(),
  headers: zodErrorSchema.nullable(),
  query: zodErrorSchema.nullable(),
  body: zodErrorSchema.nullable(),
});

function extractIssues(data: any): Issue[] {
  if (!data) return [];

  const issuesCheck = z.array(issueSchema).safeParse(data);
  if (issuesCheck.success) return issuesCheck.data;

  const bodyCheck = z.array(issueSchema).safeParse(data?.body?.errors);
  if (bodyCheck.success) return bodyCheck.data;

  const routeZodCheck = routeZodSchema.safeParse(data);

  const issues: Issue[] = [];
  if (routeZodCheck.success) {
    Object.entries(routeZodCheck.data).forEach(([key, zodError]) => {
      if (!zodError) return;
      issues.push(
        ...zodError.issues.map((iss) => ({
          ...iss,
          path: [key, ...iss.path],
        })),
      );
    });
  }
  return issues;
}

export const zodErrorHandler = (
  err: RequestValidationError | $ZodIssue[],
  req: Request,
  res: Response,
  next: NextFunction,
  type: 'request' | 'response',
) => {
  const issues: Issue[] = extractIssues(err);
  if (!issues.length) return next();

  const fields: ServerErrorResponse['errorFields'] = issues.map(({ message, path }) => ({
    message,
    name: path.join('.'),
  }));

  if (type === 'request') {
    if (fields.some((f) => f.name === 'headers.authorization'))
      return res.status(401).json(new ServerError(ErrorCode.InvalidAuthToken).toResponse());

    return res.status(400).json(new ServerError(ErrorCode.BadRequest, fields).toResponse());
  }

  logger.error('Response parse errors:', {
    path: req.path,
    method: req.method,
    issues,
  });

  res.status(422).json(new ServerError(ErrorCode.ResponseParseFailed, fields).toResponse());
};
