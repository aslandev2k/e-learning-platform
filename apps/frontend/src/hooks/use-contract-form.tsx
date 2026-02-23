import { zodResolver } from '@hookform/resolvers/zod';
import type { ClientResponse } from '@repo/zod-schemas/src/api/response';
import { useMutation } from '@tanstack/react-query';
import { type UseFormProps, type UseFormReturn, useForm } from 'react-hook-form';
import type { ZodObject, z } from 'zod';
import { logger } from '@/lib/client-logger';

export function useContractForm<TSchema extends ZodObject, ResponseData>(
  props: Omit<UseFormProps<z.input<TSchema>>, 'resolver'> & {
    schema: TSchema;
    contractAPI: (body: z.infer<TSchema>) => Promise<ClientResponse<ResponseData>>;
    onSuccess: (res: ResponseData, payload: z.infer<TSchema>) => void;
    onError?: (
      res: Extract<ClientResponse<ResponseData>, { success: false }>,
      payload: z.infer<TSchema>,
    ) => void;
  },
): {
  methods: UseFormReturn<z.input<TSchema>, unknown, z.input<TSchema>>;
  isPending: boolean;
  onSubmit: () => Promise<void>;
} {
  const methods = useForm<z.input<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema, undefined, {
      raw: true,
    }),
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (body: z.input<TSchema>) => {
      const parsedData = props.schema.parse(body);
      const res = await props.contractAPI(parsedData);
      if (res.success) props.onSuccess(res.data, parsedData);
      else {
        // Set error message chung vào field ảo _errorMessage để hiển thị
        methods.setError('_errorMessage' as any, { message: res.message });
        props.onError?.(res, parsedData);
      }
    },
  });

  return {
    methods,
    isPending,
    onSubmit: methods.handleSubmit(
      (data) => mutateAsync(data),
      (errors) => {
        logger.error('logger ~ useContractForm.tsx ~ line 57:', methods.getValues());
        logger.error(
          'logger ~ useContractForm.tsx ~ line 57:',
          props.schema.safeParse(methods.getValues()),
        );
        logger.error('Form submit errors', errors);
      },
    ),
  };
}
