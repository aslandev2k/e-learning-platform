import { serverErrorResponse } from '@repo/zod-schemas/src/api/server-response.schema';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '@/utils/logger';

export const responseStatusLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data: unknown) {
    const { statusCode } = res;
    if (statusCode < 400) {
      logger.verbose(`${req.method}: ${req.path} ==> ${statusCode}`);
    } else {
      const errorResponse = serverErrorResponse.safeParse(data);
      const log = statusCode >= 500 ? logger.error : statusCode >= 400 ? logger.warn : logger.http;
      const message = errorResponse.success ? errorResponse.data.message : 'Unknown error';
      log(`${req.method}: ${req.path} ==> ${statusCode} - ${message}`);
    }
    return originalJson.call(this, data);
  };

  next();
};
