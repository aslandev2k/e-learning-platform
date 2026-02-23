import { ChevronDown, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type ZodType, z } from 'zod';
import ClearInputButton from '@/components/common/clear-input-button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';

const ASYNC_SEARCH_CACHE_KEY = 'async-search-combobox-cache';

const optionSchema = z.object({
  key: z.string(),
  data: z.any(),
  label: z.string(),
});

const getOptionFromCache = <T,>(key: string): AsyncSearchComboboxOption<T> | null => {
  try {
    const cached = localStorage.getItem(ASYNC_SEARCH_CACHE_KEY);
    if (!cached) return null;
    const allCached = JSON.parse(cached) as Record<string, unknown>;
    const data = allCached[key];
    const result = optionSchema.safeParse(data);
    if (!result.success) {
      return null;
    }
    return result.data as AsyncSearchComboboxOption<T>;
  } catch {
    return null;
  }
};

const cacheOption = <T,>(option: AsyncSearchComboboxOption<T>): void => {
  try {
    const result = optionSchema.safeParse(option);
    if (!result.success) {
      return;
    }
    const cached = localStorage.getItem(ASYNC_SEARCH_CACHE_KEY);
    const allCached = cached
      ? (JSON.parse(cached) as Record<string, AsyncSearchComboboxOption<T>>)
      : {};
    allCached[option.key] = result.data;
    localStorage.setItem(ASYNC_SEARCH_CACHE_KEY, JSON.stringify(allCached));
  } catch {
    // Silently fail
  }
};

export type AsyncSearchComboboxOption<T = any> = {
  data: T;
  label: string;
  key: string;
};

export const AsyncSearchComboboxOptionSchema = <T extends ZodType>(
  schema: T,
  errorMessage: string,
) =>
  z.object(
    {
      data: schema,
      label: z.string(),
      key: z.string(),
    },
    errorMessage,
  );

export type AsyncSearchComboboxProps<T = any> = {
  defaultOption?: AsyncSearchComboboxOption<T>;
  /**
   * Default option key to restore from cache when page reloads
   */
  defaultKeyOption?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Read-only mode: Cannot search or change value (but can view)
   */
  readonly?: boolean;
  className?: string;
  contentSide?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * ID for the input trigger (for label htmlFor)
   */
  id?: string;

  /**
   * Async search function that receives query and returns options
   */
  onSearch: (query: string) => Promise<AsyncSearchComboboxOption<T>[]>;

  /**
   * Called when user commits a value.
   * Should be used for async side-effects (API, mutation, toast, ...)
   */
  onCommit: (option: AsyncSearchComboboxOption<T>) => Promise<void>;
  onClear?: () => Promise<void>;
};

function AsyncSearchCombobox<T = any>({
  defaultOption,
  defaultKeyOption,
  placeholder = 'Tìm kiếm...',
  disabled,
  readonly,
  className,
  contentSide = 'bottom',
  id,
  onSearch,
  onCommit,
  onClear,
}: AsyncSearchComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [options, setOptions] = useState<AsyncSearchComboboxOption<T>[]>([]);
  const [selectedOption, setSelectedOption] = useState<AsyncSearchComboboxOption<T> | null>(() => {
    if (defaultOption) {
      return defaultOption;
    }
    if (defaultKeyOption) {
      return getOptionFromCache<T>(defaultKeyOption);
    }
    return null;
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { search, updateSearch, debouncedSearch } = useDebouncedSearch({ query: '' });

  // Perform async search
  useEffect(() => {
    if (!isOpen) return;

    const performSearch = async () => {
      try {
        setIsSearching(true);
        const query = debouncedSearch.query?.trim() || '';
        const results = await onSearch(query);
        setOptions(results);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch.query, onSearch, isOpen]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  const handleSelectOption = useCallback(
    async (option: AsyncSearchComboboxOption<T>) => {
      if (isPending) return;

      try {
        setIsPending(true);
        cacheOption(option);
        await onCommit(option);
        setSelectedOption(option);
        setIsOpen(false);
      } finally {
        setIsPending(false);
      }
    },
    [isPending, onCommit],
  );

  const handleClear = useCallback(async () => {
    if (isPending) return;

    try {
      setIsPending(true);
      if (onClear) {
        await onClear();
        setSelectedOption(null);
      }
      setSelectedOption(null);
      updateSearch({ query: '' });
    } finally {
      setIsPending(false);
    }
  }, [isPending, onClear, updateSearch]);

  return (
    <Popover
      open={isOpen && !disabled && !readonly}
      onOpenChange={(open) => !disabled && !readonly && setIsOpen(open)}
    >
      <PopoverTrigger asChild>
        <InputGroup className={className}>
          <InputGroupInput
            key={selectedOption?.key}
            id={id}
            placeholder={placeholder}
            disabled={disabled || isPending}
            readOnly
            onClick={() => !readonly && !disabled && setIsOpen(true)}
            className={readonly ? 'cursor-not-allowed' : 'cursor-pointer'}
            value={selectedOption?.label}
          />
          <InputGroupAddon align='inline-end'>
            {selectedOption && onClear ? (
              <ClearInputButton onClear={handleClear} />
            ) : (
              <ChevronDown className='pointer-events-none opacity-50' />
            )}
          </InputGroupAddon>
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent
        side={contentSide}
        onWheel={(e) => e.stopPropagation()}
        className='w-96 p-0 pointer-events-auto *:pointer-events-auto'
      >
        <div className='flex flex-col gap-2 p-2'>
          <InputGroup>
            <InputGroupInput
              ref={searchInputRef}
              placeholder='Nhập để tìm kiếm'
              value={search.query || ''}
              onChange={(e) => updateSearch({ query: e.target.value })}
              disabled={isPending || disabled || readonly}
              className='h-9 rounded-md'
            />
            <InputGroupAddon align='inline-end'>
              <Search className='pointer-events-none' />
            </InputGroupAddon>
          </InputGroup>

          <div className='max-h-64 overflow-y-auto border rounded-md'>
            {isSearching && (
              <div className='flex items-center justify-center py-8'>
                <Spinner />
              </div>
            )}

            {!isSearching && options.length === 0 && search.query?.trim() && (
              <div className='py-6 px-4 text-center text-sm text-muted-foreground'>
                Không tìm thấy kết quả
              </div>
            )}

            {!isSearching && options.length > 0 && (
              <div className='divide-y'>
                {options.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSelectOption(option)}
                    disabled={isPending}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {!isSearching && !search.query?.trim() && options.length === 0 && (
              <div className='py-6 px-4 text-center text-sm text-muted-foreground'>
                Nhập để tìm kiếm
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AsyncSearchCombobox;
