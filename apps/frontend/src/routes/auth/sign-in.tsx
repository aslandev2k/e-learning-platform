import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { commonZod } from '@repo/zod-schemas/src/common';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ZodForm, { createZodFormProps } from '@/components/zod-form/zod-form';
import { clientAPI } from '@/config/clientAPI.config';
import clientCookie from '@/lib/client-cookie';
import { logger } from '@/lib/client-logger';
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/auth/sign-in')({
  component: RouteComponent,
  validateSearch: z.object({
    email: commonZod.email.optional().catch(undefined),
    relativePath: z.string().startsWith('/').optional().catch(undefined),
  }),
  loader: async () => {
    const user = await currentUserRepository()
      .loader()
      .catch(() => undefined);
    if (user) throw redirect({ to: '/app' });
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { email, relativePath } = Route.useSearch();

  const handleSignInSuccess = async (data: { accessToken: string }) => {
    clientCookie.saveAuthToken(data.accessToken);
    await currentUserRepository().invalidate();

    if (relativePath) {
      navigate({ unsafeRelative: 'path', to: relativePath });
    } else {
      navigate({ to: '/app' });
    }
  };

  const signInZodFormProps = createZodFormProps({
    schema: authContract.login.body,
    defaultValues: { email },
    contractAPI: (body) => clientAPI.Auth.login({ body }),
    displayOptions: {
      email: { label: 'Email' },
      password: { label: 'Mật khẩu' },
    },
    onSuccess: handleSignInSuccess,
    onError(res) {
      logger.error('logger ~ sign-in.tsx ~ onError:', res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Đăng nhập' },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Vui lòng nhập thông tin đăng nhập để truy cập vào hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ZodForm {...signInZodFormProps} />
      </CardContent>
    </Card>
  );
}
