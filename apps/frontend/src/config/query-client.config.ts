import { QueryClient } from '@tanstack/react-query';
import { parseTime } from '@/lib/timeValue';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: parseTime.toMilliseconds('1h'),
      staleTime: parseTime.toMilliseconds('30m'),
      retry: false,
    },
  },
});
