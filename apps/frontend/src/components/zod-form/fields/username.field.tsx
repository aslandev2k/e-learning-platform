import { User } from 'lucide-react';
import type { ComponentProps } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

const UsernameField = ({
  formField,
  className,
  ...props
}: {
  formField: ControllerRenderProps<FieldValues, string>;
} & ComponentProps<'input'>) => {
  const lowerName = formField.name;
  const isDisplay = lowerName.includes('username');

  if (!isDisplay) return null;

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        {...formField}
        className={cn(className, props.readOnly && 'cursor-not-allowed!')}
      />
      <InputGroupAddon align='inline-start' className='gap-0 border-r pr-2'>
        <User />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default UsernameField;
