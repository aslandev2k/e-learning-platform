import { pickFields } from '@repo/shared/src/common/object.helper';
import { serverErrorResponse } from '@repo/zod-schemas/src/api/server-response.schema';
import { OpenAPIHelper } from '@repo/zod-schemas/src/openapi/openAPI.helper';
import type { AppRoute } from '@ts-rest/core';
import type { TsRestRequest } from '@ts-rest/express';
import type { NextFunction, Request, Response } from 'express';
import { envData } from '@/env-data';
import { logger } from '@/utils/logger';

export const responseJsonValidation = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data: unknown) {
    const { statusCode } = res;
    if (statusCode < 400) return originalJson.call(this, data);

    const checkErrorResponse = serverErrorResponse.safeParse(data);

    if (checkErrorResponse.success) {
      const { code } = checkErrorResponse.data;

      const routeContract = (req as unknown as TsRestRequest<AppRoute>).tsRestRoute;

      const contractErrorCodes = OpenAPIHelper.getContractErrorCodes(routeContract);

      if (!contractErrorCodes.includes(code)) {
        const message = `"ErrorCode.${code}" is not registered in the API contract metadata.errorCodes`;
        const contractInfo = pickFields(routeContract, ['summary', 'method', 'path', 'metadata']);
        logger.error(message, { info: contractInfo });
        if (envData.mode === 'development') throw Error(message, { cause: contractInfo });
      }

      return originalJson.call(this, checkErrorResponse.data);
    }

    logger.warn('responseJsonValidation invalid data format', {
      path: req.path,
      data,
    });
    return originalJson.call(this, data);
  };

  next();
};
