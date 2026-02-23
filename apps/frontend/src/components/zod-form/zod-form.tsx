import type { ClientResponse } from '@repo/zod-schemas/src/api/response';
import { SCHEMA_DESCRIPTION } from '@repo/zod-schemas/src/common';
import { InfoIcon } from 'lucide-react';
import { type DefaultValues, FormProvider } from 'react-hook-form';
import {
  ZodCatch,
  ZodDefault,
  ZodNullable,
  type ZodObject,
  ZodOptional,
  ZodPipe,
  type ZodType,
  z,
} from 'zod';
import { LoadingButton } from '@/components/loading-button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { useContractForm } from '@/hooks/use-contract-form';
import { logger } from '@/lib/client-logger';
import { cn } from '@/lib/utils';
import type { FieldDisplayOption, FieldInfo } from './zod-field';
import ZodField from './zod-field';

type Schema = z.ZodType;
type FieldKeys<T extends ZodObject> = keyof T['shape'];

const hasDefault = <T extends Schema>(
  schema: T,
): schema is T & { _def: { defaultValue: () => any } } => schema instanceof ZodDefault;

const isOptional = <T extends Schema>(schema: T) => schema.safeParse(undefined).success;

const getFinalTypeName = (schema: ZodType) => {
  if (schema.description === SCHEMA_DESCRIPTION.DATETIME) return 'datetime';
  if (schema instanceof ZodPipe) return getFinalTypeName(schema.def.out as any);
  if (
    schema instanceof ZodCatch ||
    schema instanceof ZodOptional ||
    schema instanceof ZodNullable ||
    schema instanceof ZodDefault
  )
    return getFinalTypeName(schema.def.innerType as any);
  if (schema instanceof ZodNullable) return getFinalTypeName(schema.def.innerType as any);
  if (!schema?.type) {
    logger.error('getFinalTypeName:', schema);
    return 'unknown';
  }
  return schema.type;
};

const analyzeSchema = (schema: ZodObject): FieldInfo[] => {
  return Object.entries(schema.shape).map(([key, fieldSchema]) => {
    const field: ZodType = fieldSchema as ZodType;
    const fieldType = getFinalTypeName(field);

    const typeCheck = z
      .enum(['string', 'number', 'boolean', 'datetime', 'enum', 'array', 'object'], {
        error: `Unsupported field type: ${fieldType}`,
      })
      .safeParse(fieldType);
    if (!typeCheck.success) {
      throw Error(`Unssuport zod form field:'${fieldType}'!`, { cause: schema.shape });
    }
    return {
      fieldName: key,
      type: typeCheck.data,
      required: !isOptional(field) && !hasDefault(field),
    };
  });
};

export interface ZodFormProps<TSchema extends ZodObject, ResSuccessData> {
  schema: TSchema;
  displayOptions: Record<FieldKeys<TSchema>, FieldDisplayOption>;
  contractAPI: (body: z.infer<TSchema>) => Promise<ClientResponse<ResSuccessData>>;
  onSuccess: (data: ResSuccessData, payload: z.infer<TSchema>) => void;
  onError?: (
    res: Extract<ClientResponse<ResSuccessData>, { success: false }>,
    payload: z.infer<TSchema>,
  ) => void;
  submitBtn?: {
    text: string;
    className?: string;
  };
  defaultValues: DefaultValues<z.input<TSchema>>;
  afterSuccess?: 'reset' | 'close';
  dialogOptions?: {
    blockOutsideClick?: boolean;
  };
}

export const createZodFormProps = <TSchema extends ZodObject, ResSuccessData>(
  props: ZodFormProps<TSchema, ResSuccessData>,
) => props;

const ZodForm = <TSchema extends ZodObject = ZodObject, ResSuccessData = any>({
  schema,
  contractAPI,
  displayOptions,
  onError,
  onSuccess,
  submitBtn = { text: 'Gửi' },
  defaultValues,
}: ZodFormProps<TSchema, ResSuccessData>) => {
  const fieldsInfo = analyzeSchema(schema);
  const { isPending, onSubmit, methods } = useContractForm<TSchema, ResSuccessData>({
    schema,
    contractAPI,
    onSuccess: (...props) => {
      onSuccess(...props);
    },
    onError,
    defaultValues,
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={onSubmit} className='flex flex-col gap-4'>
        <div className={cn('flex flex-col gap-4')}>
          <div className='grid grid-cols-1 @4xl/main:grid-cols-6 gap-x-4 gap-y-2'>
            {Object.entries(displayOptions).map(([fieldName, displayOption]) => {
              const fieldInfo = fieldsInfo.find((info) => fieldName === info.fieldName);
              if (!fieldInfo || displayOption.hidden) return null;
              return (
                <ZodField
                  key={fieldName}
                  displayOption={displayOption}
                  fieldInfo={fieldInfo}
                  isPending={isPending}
                  onSubmit={onSubmit}
                  defaultValue={defaultValues[fieldName]}
                  fieldSchema={schema.shape[fieldName] as ZodType}
                />
              );
            })}
          </div>
          {/* Error message field - chỉ hiển thị khi có lỗi */}
          {methods.formState.errors._errorMessage?.message && (
            <Alert className='w-full bg-destructive/10 border border-destructive! text-destructive'>
              <InfoIcon />
              <AlertTitle className='line-clamp-none! whitespace-pre-wrap'>
                {String(methods.formState.errors._errorMessage.message)}
              </AlertTitle>
            </Alert>
          )}
          <div className='w-full flex'>
            <LoadingButton
              type='submit'
              variant='default'
              className={submitBtn.className}
              isLoading={isPending}
            >
              {submitBtn.text}
            </LoadingButton>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ZodForm;
