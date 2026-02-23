import type { ComponentProps } from 'react';
import { type ControllerRenderProps, type FieldValues, useFormContext } from 'react-hook-form';
import { InputPassword } from '@/components/input-password';

const PasswordField = ({
  formField,
  isNewPassword = false,
  ...props
}: {
  formField: ControllerRenderProps<FieldValues, string>;
  isNewPassword?: boolean;
} & ComponentProps<'input'>) => {
  const { setValue } = useFormContext();
  return (
    <InputPassword
      autoCapitalize='off'
      onGeneratePassword={
        isNewPassword
          ? (value) => {
              if (isNewPassword) {
                setValue(formField.name, value);
              }
            }
          : undefined
      }
      {...props}
      {...formField}
    />
  );
};

export default PasswordField;
