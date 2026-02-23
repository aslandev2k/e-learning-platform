import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import { keepPreviousData, type QueryKey, useQuery } from '@tanstack/react-query';
import { isRedirect } from '@tanstack/react-router';
import { z } from 'zod';
import { queryClient } from '@/config/query-client.config';
import { logger } from '@/lib/client-logger';

type CreateQueryRepositoryOptions<TData, TParams = never> = {
  queryKey: (params: TParams) => QueryKey;
  queryFn: (params: TParams) => Promise<TData>;
  defaultData: NonNullable<TData>;
  searchMode?: boolean;
};

type MaybeParams<T> = T extends void ? [] : [params: T];

export function createQueryRepository<TData, TParams = void>({
  queryKey,
  queryFn,
  defaultData,
  searchMode = false,
}: CreateQueryRepositoryOptions<TData, TParams>) {
  return (...args: MaybeParams<TParams>) => {
    const params = (args[0] as TParams)!;

    const resolvedKey = queryKey(params);

    const useRepositoryQuery = () => {
      const { data = defaultData, ...props } = useQuery({
        queryKey: resolvedKey,
        queryFn: () => queryFn(params),
        placeholderData: searchMode ? keepPreviousData : undefined,
      });

      return { data, ...props };
    };

    const loader = async () => {
      const queryState = queryClient.getQueryState(resolvedKey);
      const { isInvalidated = true } = queryState || {};

      const fetchFn = async () => {
        if (isInvalidated) {
          return queryClient.fetchQuery({
            queryKey: resolvedKey,
            queryFn: () => queryFn(params),
          });
        }

        return queryClient.ensureQueryData({
          queryKey: resolvedKey,
          queryFn: () => queryFn(params),
        });
      };

      return fetchFn().catch((e) => {
        if (isRedirect(e)) throw e;
        if (e instanceof Error) {
          const parsedError = z.object({ errorCode: z.enum(ErrorCode) }).safeParse(e.cause);
          if (parsedError.success) {
            logger.info('logger ~ -createQueryRepository.ts ~ line 50:', parsedError);
            // throwIfUnauthorizeError(parsedError.data.errorCode);
            // throwIfForbiddenError(parsedError.data.errorCode);
          }
        }
        logger.warn('Loader error but not throw redirect', e);
        return defaultData;
      });
    };

    const updateCache = (updater: Partial<TData> | ((old: TData) => TData)) =>
      queryClient.setQueryData<TData>(resolvedKey, (old) => {
        if (!old) return defaultData as TData;

        if (typeof updater === 'function') {
          return updater(old);
        }

        return {
          ...old,
          ...updater,
        };
      });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: resolvedKey });

    const get = () => queryClient.getQueryData<TData>(resolvedKey);

    const refetch = async () => {
      await queryClient.refetchQueries({
        queryKey: resolvedKey,
      });
      return get() || defaultData;
    };

    return {
      queryKey: resolvedKey,
      useQuery: useRepositoryQuery,
      loader,
      updateCache,
      invalidate,
      get,
      refetch,
    };
  };
}
