import { ERROR_DATA, ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { type ClientResponse, clientResponseSchema } from '@repo/zod-schemas/src/api/response';
import { appContract } from '@repo/zod-schemas/src/api-contract';
import { type ApiFetcher, initClient, isAppRouteMutation, tsRestFetchApi } from '@ts-rest/core';
import { toast } from 'sonner';
import { ZodError, ZodObject } from 'zod';
import clientCookie from '@/lib/client-cookie';
import { logger } from '@/lib/client-logger';
import { URLManager } from '@/lib/urlManager';
import type { FileRouteTypes } from '@/routeTree.gen';

type DecrementDepth<T extends number> = T extends 4
  ? 3
  : T extends 3
    ? 2
    : T extends 2
      ? 1
      : T extends 1
        ? 0
        : 0;

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type ExtractArgs<P> = P extends object
  ? OmitNever<{
      [K in keyof P & ('body' | 'params' | 'query')]: NonNullable<P[K]> extends object
        ? keyof NonNullable<P[K]> extends never
          ? never
          : P[K]
        : never;
    }> extends infer R
    ? keyof R extends never
      ? never
      : R
    : never
  : never;

type CleanArgs<T> = ExtractArgs<T>;

type ExtractResponse<T> =
  T extends Promise<infer U> ? (U extends { body: { data: infer G } } ? G : never) : never;

type CustomType<T, Depth extends number = 2> = Depth extends 0
  ? T
  : {
      [TKey in keyof T]: T[TKey] extends (...args: [infer P]) => infer R
        ? CleanArgs<P> extends never
          ? () => Promise<ClientResponse<ExtractResponse<R>>>
          : (...args: [CleanArgs<P>]) => Promise<ClientResponse<ExtractResponse<R>>>
        : T[TKey] extends {}
          ? CustomType<T[TKey], DecrementDepth<Depth>>
          : T[TKey];
    };

const customInitClientType = <T>(a: T): CustomType<T> => a as CustomType<T>;

const customResponseType = (data: ClientResponse): ReturnType<ApiFetcher> =>
  data as unknown as ReturnType<ApiFetcher>;

export const clientAPI = customInitClientType(
  initClient(appContract, {
    baseUrl: import.meta.env.VITE_SERVER_URL,
    jsonQuery: true,
    validateResponse: false,
    credentials: 'omit',
    api: async (args): ReturnType<ApiFetcher> => {
      const info = `${args.method.toUpperCase()}: ${args.path}`;
      let clientResponse: ClientResponse;
      if (isAppRouteMutation(args.route) && args.route.body instanceof ZodObject) {
        args.body = JSON.stringify(args.route.body.parse(args.rawBody));
      }
      if (args.route.headers instanceof ZodObject) {
        const token = clientCookie.getAuthToken();
        logger.info('logger ~ clientAPI.config.ts ~ line 80:', token);
        if (token) args.headers.Authorization = `Bearer ${token}`;
        else {
          logger.error('Token not found:', info);
          return customResponseType({
            success: false,
            errorCode: ErrorCode.LoginRequired,
            ...ERROR_DATA[ErrorCode.LoginRequired],
          });
        }
      } else args.headers.Authorization = 'This API requires no token.';

      return tsRestFetchApi(args)
        .then((rawResult) => {
          logger.info('logger ~ clientAPI.config.ts ~ line 90:', rawResult);
          const res = clientResponseSchema.parse(rawResult.body);
          if (!res.success && res.errorCode === ErrorCode.LoginRequired) {
            const url = new URLManager()
              .setPath('/auth/sign-out' as FileRouteTypes['id'])
              .clearSearch();
            window.location.href = url.toString();
          }
          const log = res.success ? logger.info : logger.error;
          log('logger ~ clientAPI.config.ts ~ line 104:', { info, ...res });
          return customResponseType(res);
        })
        .catch((error) => {
          logger.info('logger ~ clientAPI.config.ts ~ line 103:', { error });
          if (import.meta.env.DEV && error instanceof ZodError) {
            const fieldErrors = error.issues
              .map((issue) => {
                const fieldName = issue.path.length > 0 ? issue.path.join('.') : 'unknown';
                return `ErrorField: "${fieldName}" - Message:"${issue.message}"`;
              })
              .join(' | ');
            const errorMessage = `${info} | ${fieldErrors}`;
            toast.error(errorMessage, { duration: 30000, closeButton: true });
            logger.error('Validation Error:', { info, issues: error.issues });
          }

          logger.error(
            'Failed to fetch from API. Server may be down or unreachable (ERR_CONNECTION_REFUSED).',
            { error },
          );
          clientResponse = clientResponseSchema.parse({ code: ErrorCode.ServiceUnavailable });
          return customResponseType(clientResponse);
        });
    },
  }),
);
