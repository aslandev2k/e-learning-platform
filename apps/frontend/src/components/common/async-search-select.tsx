import { useEffect, useState } from 'react';
import ClearInputButton from '@/components/common/clear-input-button';
import { buttonVariantClasses } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { cn } from '@/lib/utils';

export type AsyncSearchSelectOption = {
  value: string;
  label: React.ReactNode;
};

export type AsyncSearchSelectProps<T extends AsyncSearchSelectOption> = {
  option?: T;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  contentSide?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'center' | 'end' | 'start';

  /**
   * Async search function that receives query and returns options
   */
  onSearch: (query: string) => Promise<T[]>;

  /**
   * Called when user commits a value.
   * Should be used for async side-effects (API, mutation, toast, ...)
   */
  onCommit: (option: T) => Promise<void>;
  onClear?: () => Promise<void>;
};

type AsyncSearchSelectOptionsProps<T extends AsyncSearchSelectOption> = {
  debouncedQuery: string;
  onSearch: (query: string) => Promise<T[]>;
};

function AsyncSearchSelectOptions<T extends AsyncSearchSelectOption>({
  debouncedQuery,
  onSearch,
}: AsyncSearchSelectOptionsProps<T>) {
  const [isSearching, setIsSearching] = useState(false);
  const [options, setOptions] = useState<T[]>([]);

  useEffect(() => {
    if (!debouncedQuery?.trim()) {
      setOptions([]);
      return;
    }

    const performSearch = async () => {
      try {
        setIsSearching(true);
        const results = await onSearch(debouncedQuery);
        setOptions(results);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, onSearch]);

  return (
    <>
      {isSearching && (
        <div className='flex items-center justify-center py-2'>
          <Spinner />
        </div>
      )}
      {!isSearching && debouncedQuery?.trim() && options.length === 0 && (
        <div className='py-2 text-sm text-muted-foreground text-center'>Không tìm thấy kết quả</div>
      )}
      {options.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </>
  );
}

function AsyncSearchSelect<T extends AsyncSearchSelectOption>({
  option,
  placeholder = 'Search...',
  disabled,
  className,
  contentSide = 'right',
  align = 'start',
  onSearch,
  onCommit,
  onClear,
}: AsyncSearchSelectProps<T>) {
  const [isPending, setIsPending] = useState(false);
  const [allOptions, setAllOptions] = useState<T[]>([]);
  const { search, updateSearch, debouncedSearch } = useDebouncedSearch({ query: '' });

  const showClear = !!option && !disabled && !isPending && !!onClear;

  // Track options for handleCommit lookup
  useEffect(() => {
    if (!debouncedSearch.query?.trim()) {
      setAllOptions([]);
      return;
    }

    const performSearch = async () => {
      const results = await onSearch(debouncedSearch.query!);
      setAllOptions(results);
    };

    performSearch();
  }, [debouncedSearch.query, onSearch]);

  const handleCommit = async (newValue: string) => {
    if (!onCommit || isPending) return;

    const selectedOption = allOptions.find((o) => o.value === newValue);
    if (!selectedOption) return;

    try {
      setIsPending(true);
      await onCommit(selectedOption);
      updateSearch({ query: '' });
      setAllOptions([]);
    } finally {
      setIsPending(false);
    }
  };

  const icon = isPending ? (
    <Spinner />
  ) : showClear ? (
    <ClearInputButton
      className='translate-x-1'
      onClear={() => {
        setIsPending(true);
        onClear?.().finally(() => {
          setIsPending(false);
          updateSearch({ query: '' });
          setAllOptions([]);
        });
      }}
    />
  ) : undefined;

  return (
    <Select
      value={option?.value ?? ''}
      disabled={disabled || isPending}
      onValueChange={handleCommit}
    >
      <SelectTrigger
        className={cn(
          buttonVariantClasses.ghost,
          'w-32',
          isPending && 'animate-pulse cursor-wait!',
          className,
        )}
        icon={icon}
      >
        <SelectValue placeholder={option?.label ?? placeholder} />
      </SelectTrigger>

      <SelectContent side={contentSide} position='popper' align={align} className='max-h-80'>
        <div className='p-2'>
          <Input
            placeholder='Tìm kiếm...'
            value={search.query}
            onChange={(e) => updateSearch({ query: e.target.value })}
            className='mb-2'
          />
          <AsyncSearchSelectOptions<T> debouncedQuery={debouncedSearch.query} onSearch={onSearch} />
        </div>
      </SelectContent>
    </Select>
  );
}

export default AsyncSearchSelect;
