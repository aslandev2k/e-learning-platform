import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { HEADER_AUTH_DESCRIPTION } from '@repo/zod-schemas/src/api-contract/schemas/token.schema';
import type { AppRouter } from '@ts-rest/core';
import type { TsRestExpressOptions } from '@ts-rest/express';
import { ZodObject } from 'zod';
import { zodErrorHandler } from './requestValidationErrorHandler';
import { tokenVerifyUser } from './token.verify';

export const routerDefaultOptions = <T extends AppRouter>(): TsRestExpressOptions<T> => ({
  requestValidationErrorHandler: (err, req, res, next) => {
    return zodErrorHandler(err as any, req, res, next, 'request');
  },
  responseValidation: true,
  globalMiddleware: [
    async (req, _res, next) => {
      if (req.tsRestRoute.deprecated) return next(new Error(ErrorCode.Deprecated));
      next();
    },
    async (req, res, next) => {
      if (
        req.tsRestRoute.headers instanceof ZodObject &&
        req.tsRestRoute.headers.description === HEADER_AUTH_DESCRIPTION
      )
        return tokenVerifyUser(req, res, next);
      if (req.headers?.authorization) req.headers.authorization = '';
      next();
    },
  ],
});
