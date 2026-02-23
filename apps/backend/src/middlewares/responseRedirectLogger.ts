import type { NextFunction, Request, Response } from 'express';
import { logger } from '@/utils/logger';

export const responseRedirectLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalRedirect = res.redirect;

  res.redirect = function (...args: unknown[]) {
    logger.verbose('Redirect triggered', {
      path: req.path,
      redirectTo: args.join(' '),
    });
    return originalRedirect.apply(this, args as any);
  };

  next();
};
