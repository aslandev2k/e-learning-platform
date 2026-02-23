import type { NextFunction, Request, Response } from 'express';
import { TokenService } from '@/services/auth-token.service';

// globalMiddleware – applies to all route contracts that use jwtAuthHeaderSchema
export const tokenVerifyUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.headers) req.headers.token = undefined;
    const tokenData = await TokenService.verifyOrError(req.headers.authorization || '');
    req.headers.token = tokenData as any;
    next();
  } catch (error) {
    next(error);
  }
};
