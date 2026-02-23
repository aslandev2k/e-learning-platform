import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

function AsyncButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  onClick,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onClick'> &
  VariantProps<typeof buttonVariants> & {
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>;
  }) {
  const [isLoading, setIsLoading] = useState(false);
  const hideChildren = isLoading && size === 'icon';
  return (
    <button
      className={cn(
        buttonVariants({ variant, size, className }),
        isLoading && 'cursor-progress animate-pulse opacity-50',
      )}
      onClick={(e) => {
        setIsLoading((old) => {
          if (!old) {
            onClick(e).finally(() => {
              setIsLoading(false);
            });
          }
          return true;
        });
      }}
      data-slot='button'
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {!hideChildren && children}
      {isLoading && <Spinner className='stroke-[currentColor]' />}
    </button>
  );
}

export { AsyncButton };
