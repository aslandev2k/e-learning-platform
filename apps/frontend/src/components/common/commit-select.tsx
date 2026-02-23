import { useCallback, useState } from 'react';
import ClearInputButton from '@/components/common/clear-input-button';
import { buttonVariantClasses } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type CommitSelectOption<TData extends string | number> = {
  value: TData;
  label: React.ReactNode;
};

export type CommitSelectProps<TData extends string | number> = {
  defaultValue?: string | number;
  options: readonly CommitSelectOption<TData>[];
  placeholder: string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  contentSide?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'center' | 'end' | 'start';
  /**
   * ID for the select trigger (for label htmlFor)
   */
  id?: string;

  /**
   * Called when user commits a value.
   * Should be used for async side-effects (API, mutation, toast, ...)
   */
  onCommit: (option: CommitSelectOption<TData>) => Promise<void>;
  onClear?: () => Promise<void>;
};

function CommitSelect<TData extends string | number>({
  defaultValue,
  options,
  placeholder,
  disabled,
  readonly,
  className,
  contentSide = 'right',
  align = 'start',
  id,
  onCommit,
  onClear,
}: CommitSelectProps<TData>) {
  const [isPending, setIsPending] = useState(false);
  const [value, setValue] = useState<string | number | undefined>(defaultValue);

  const isSelectDisabled = disabled || isPending || readonly;
  const showClear = !!value && !disabled && !isPending && !!onClear;

  const handleCommit = useCallback(
    async (newValue: string | number) => {
      if (!onCommit || isPending) return;
      const option = options.find((o) => String(o.value) === String(newValue))!;

      try {
        setIsPending(true);
        setValue(newValue);
        await onCommit(option);
      } finally {
        setIsPending(false);
      }
    },
    [onCommit, isPending, options],
  );

  const icon = isPending ? (
    <Spinner />
  ) : showClear ? (
    <ClearInputButton
      className='translate-x-1'
      onClear={() => {
        setIsPending(true);
        onClear?.().finally(() => {
          setValue(undefined);
          setIsPending(false);
        });
      }}
    />
  ) : undefined;

  return (
    <Select
      value={value ? String(value) : ''}
      disabled={isSelectDisabled}
      onValueChange={handleCommit}
    >
      <SelectTrigger
        id={id}
        className={cn(
          buttonVariantClasses.ghost,
          'w-32',
          isPending && 'animate-pulse cursor-wait!',
          readonly && 'hover:cursor-not-allowed! opacity-100!',
          className,
        )}
        icon={icon}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent side={contentSide} position='popper' align={align}>
        {options.map((opt) => (
          <SelectItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CommitSelect;
