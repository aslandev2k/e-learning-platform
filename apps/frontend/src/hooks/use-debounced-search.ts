import { isSearchEqual } from '@repo/shared/src/common/object.helper';
import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod';

const DEBOUNCE_MS = 300;

export function useDebouncedSearch<T extends { query?: string | undefined }>(
  initialValue: T,
  querySchema?: z.ZodType<T>,
) {
  const [search, setSearch] = useState<T>(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState<T>(initialValue);
  const prevParsedRef = useRef<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (querySchema) {
        const parsed = querySchema.parse({ ...search, query: search.query });
        if (!isSearchEqual(parsed, prevParsedRef.current)) {
          prevParsedRef.current = parsed;
          setDebouncedSearch(parsed);
        }
      } else {
        setDebouncedSearch((prev) => {
          if (prev.query === search.query && isSearchEqual(prev, search)) return prev;
          return { ...search };
        });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, querySchema]);

  return {
    search, // raw state (bind UI)
    updateSearch: (part: Partial<T>) => setSearch((old) => ({ ...old, ...part })), // update search
    debouncedSearch, // parsed & deduplicated search for API call
  };
}
