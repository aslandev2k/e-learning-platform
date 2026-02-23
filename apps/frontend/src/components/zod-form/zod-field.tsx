import { SCHEMA_DESCRIPTION } from '@repo/zod-schemas/src/common';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useFormContext } from 'react-hook-form';
import {
  type ZodArray,
  ZodCatch,
  type ZodFile,
  ZodNullable,
  ZodOptional,
  type ZodString,
  type ZodType,
  type z,
} from 'zod';
import AsyncSearchCombobox, {
  type AsyncSearchComboboxOption,
} from '@/components/common/async-search-combobox';
import CommitSelect from '@/components/common/commit-select';
import { DatePickerTime } from '@/components/common/date-picker-time';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import FilePreviewField, {
  type ExistingFile,
} from '@/components/zod-form/fields/file-preview.field';
import FileUploadField from '@/components/zod-form/fields/file-upload.field';
import PasswordField from '@/components/zod-form/fields/password.field';
import UsernameField from '@/components/zod-form/fields/username.field';
import { logger } from '@/lib/client-logger';
import { cn } from '@/lib/utils';
import { FormErrorMessage } from './form-error-message';

const getFieldType = (fieldName: string, schema: ZodType) => {
  const { description } = schema;
  if (
    (schema instanceof ZodOptional ||
      schema instanceof ZodCatch ||
      schema instanceof ZodNullable) &&
    !description
  )
    return getFieldType(fieldName, schema.def.innerType as ZodType);

  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('username')) return 'username' as const;
  if (lowerName.includes('password')) return 'password' as const;
  if (description === SCHEMA_DESCRIPTION.DATETIME) return 'dateTime' as const;
  if (description === SCHEMA_DESCRIPTION.TEXTAREA) return 'textarea' as const;
  if (description === SCHEMA_DESCRIPTION.PREVIEW_FILES) return 'previewFiles' as const;
  if (description === SCHEMA_DESCRIPTION.UPLOAD_FILES) return 'uploadFiles' as const;
  if (
    lowerName.includes('existingfiles') ||
    lowerName.includes('existingattachments') ||
    lowerName.includes('previewfiles')
  )
    return 'previewFiles' as const;
  if (
    lowerName.includes('attachment') ||
    lowerName.includes('file') ||
    lowerName.includes('uploadfiles')
  )
    return 'uploadFiles' as const;
  return 'unknown' as const;
};
export interface FieldDisplayOption {
  label?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  hidden?: boolean;
  selectOptions?: { value: string | number; label: string }[];
  searchOptionsFn?: (query: string) => Promise<AsyncSearchComboboxOption[]>;
  selectMultiple?: boolean;
  placeholder?: string;
  readonly?: boolean;
  messageClassName?: string;
  labelClassName?: string;
  className?: string;
  disabled?: boolean;
  helpText?: string;
  onFileDownload?: (file: ExistingFile) => void;
}
export interface FieldInfo {
  fieldName: string;
  type: 'number' | 'string' | 'boolean' | 'datetime' | 'enum' | 'array' | 'object';
  required: boolean; // !isOptional
}

type ZodFieldProps<T extends ZodType> = {
  fieldInfo: FieldInfo;
  displayOption: FieldDisplayOption;
  isPending: boolean;
  fieldSchema: T;
  defaultValue: z.input<T>;
};

const spanClasses = [
  'col-span-1 @4xl/main:col-span-1',
  'col-span-1 @4xl/main:col-span-2',
  'col-span-1 @4xl/main:col-span-3',
  'col-span-1 @4xl/main:col-span-4',
  'col-span-1 @4xl/main:col-span-5',
  'col-span-1 @4xl/main:col-span-6',
];

const getOriginSchema = (schema: ZodType): ZodType => {
  if ('unwrap' in schema && typeof schema.unwrap === 'function')
    return getOriginSchema(schema.unwrap());
  return schema;
};

const ZodField = <T extends ZodType>({
  displayOption,
  fieldInfo,
  isPending,
  fieldSchema,
  onSubmit,
}: ZodFieldProps<T> & {
  onSubmit: () => Promise<void>;
}) => {
  const { control } = useFormContext();
  const {
    colSpan = 6,
    label,
    hidden,
    selectOptions,
    searchOptionsFn,
    placeholder,
    messageClassName = '',
    labelClassName = '',
    className = '',
    helpText,
    readonly,
  } = displayOption;
  const { fieldName, required, type } = fieldInfo;
  const fieldType = getFieldType(fieldName, fieldSchema);

  const isOTP = ['totp', 'otp'].includes(fieldName.toLowerCase());
  const fieldWidth = spanClasses[colSpan - 1];
  const disabled = isPending || displayOption.disabled;
  const fieldId = `field-${fieldName}`;

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field: formField }) => {
        return (
          <FormItem hidden={hidden} className={cn(fieldWidth, 'flex w-full flex-col', className)}>
            {label && (
              <FormLabel
                htmlFor={fieldId}
                required={fieldInfo.required}
                className={cn(labelClassName, 'relative w-fit gap-1')}
              >
                {label}
              </FormLabel>
            )}
            <FormControl>
              {fieldType === 'username' ? (
                <UsernameField formField={formField} disabled={disabled} readOnly={readonly} />
              ) : fieldType === 'password' ? (
                <PasswordField
                  formField={formField}
                  disabled={disabled}
                  readOnly={readonly}
                  isNewPassword={fieldSchema.description === SCHEMA_DESCRIPTION.NEW_PASSWORD}
                />
              ) : fieldType === 'dateTime' ? (
                <DatePickerTime
                  date={formField.value}
                  onChange={(newDate) => {
                    formField.onChange(newDate);
                    logger.info('logger ~ zod-field.tsx ~ line 151:', newDate.toLocaleString());
                  }}
                  disabled={disabled}
                />
              ) : fieldType === 'previewFiles' ? (
                <FilePreviewField formField={formField} disabled={disabled} readOnly={readonly} />
              ) : fieldType === 'uploadFiles' ? (
                <FileUploadField
                  formField={formField}
                  disabled={disabled}
                  fieldSchema={fieldSchema as unknown as ZodArray<ZodFile>}
                />
              ) : searchOptionsFn ? (
                <AsyncSearchCombobox
                  id={fieldId}
                  defaultOption={formField.value}
                  placeholder={placeholder || `Tìm kiếm ${label}`}
                  disabled={disabled}
                  readonly={readonly}
                  className={className}
                  onSearch={searchOptionsFn}
                  onCommit={async (option) => {
                    formField.onChange(option);
                  }}
                />
              ) : selectOptions ? (
                <CommitSelect
                  id={fieldId}
                  className='w-full'
                  placeholder={placeholder || `Chọn ${label}`}
                  options={selectOptions}
                  onCommit={async (option) => formField.onChange(option.value)}
                  defaultValue={formField.value}
                  contentSide='bottom'
                  disabled={disabled}
                  readonly={readonly}
                />
              ) : isOTP ? (
                <InputOTP
                  {...formField}
                  inputMode='numeric'
                  textAlign='center'
                  containerClassName='justify-center'
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  onComplete={() => onSubmit()}
                  disabled={disabled}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSeparator />
                    <InputOTPSlot index={3} className='border-l' />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              ) : fieldType === 'textarea' ? (
                <Textarea
                  id={fieldId}
                  placeholder={placeholder}
                  readOnly={readonly}
                  className={cn({
                    'cursor-not-allowed select-none!': readonly,
                  })}
                  maxLength={(getOriginSchema(fieldSchema) as ZodString).maxLength || undefined}
                  disabled={disabled}
                  defaultValue={formField.value}
                  value={undefined}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (!value) formField.onChange(null);
                    else formField.onChange(e);
                  }}
                />
              ) : type === 'string' || type === 'number' ? (
                <Input
                  id={fieldId}
                  required={required}
                  type={type === 'number' ? 'number' : 'text'}
                  placeholder={placeholder}
                  readOnly={readonly}
                  className={cn({
                    'cursor-not-allowed select-none!': readonly,
                  })}
                  maxLength={(getOriginSchema(fieldSchema) as ZodString).maxLength || undefined}
                  disabled={disabled}
                  {...formField}
                />
              ) : type === 'boolean' ? (
                <div className='flex flex-row gap-2 items-center'>
                  <Checkbox
                    id='toggle-checkbox'
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                  {helpText && (
                    <FieldLabel
                      htmlFor='toggle-checkbox'
                      className='text-xs text-muted-foreground cursor-pointer'
                    >
                      {helpText}
                    </FieldLabel>
                  )}
                </div>
              ) : null}
            </FormControl>
            {helpText && type !== 'boolean' && <FormDescription>{helpText}</FormDescription>}
            <FormErrorMessage className={messageClassName} />
          </FormItem>
        );
      }}
    />
  );
};

export default ZodField;
