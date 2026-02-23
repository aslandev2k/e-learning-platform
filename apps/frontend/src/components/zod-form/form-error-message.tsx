import React from 'react';
import { useFormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';

type FormMessageElement = HTMLParagraphElement;
type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>;
export const FormErrorMessage = React.forwardRef<FormMessageElement, FormMessageProps>(
  ({ className, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    if (!error?.message) return null;
    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-[0.8rem] font-medium text-destructive', className)}
        {...props}
      >
        {error.message}
      </p>
    );
  },
);
FormErrorMessage.displayName = 'FormErrorMessage';
