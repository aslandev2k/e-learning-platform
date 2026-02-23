import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

function LoadingButton({
  isLoading,
  children,
  className,
  variant = 'default',
  size = 'default',
  onClick,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { isLoading: boolean }) {
  return (
    <button
      data-slot='button'
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size, className }),
        isLoading && 'cursor-progress animate-pulse opacity-50',
      )}
      onClick={(e) => {
        if (isLoading) return;
        onClick?.(e);
      }}
      {...props}
    >
      {children}
      {isLoading && <Spinner />}
    </button>
  );
}

export { LoadingButton };
