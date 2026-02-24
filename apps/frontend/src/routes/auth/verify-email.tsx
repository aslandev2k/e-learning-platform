import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ZodForm, { createZodFormProps } from '@/components/zod-form/zod-form';
import { clientAPI } from '@/config/clientAPI.config';

export const Route = createFileRoute('/auth/verify-email')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();

  const verifyEmailZodFormProps = createZodFormProps({
    schema: authContract.verifyEmail.body,
    defaultValues: {
      token: token ?? '',
    },
    contractAPI: (body) => clientAPI.Auth.verifyEmail({ body }),
    displayOptions: {
      token: { label: 'Mã xác thực', hidden: !!token },
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Xác thực email thành công! Vui lòng đăng nhập.');
      navigate({ to: '/auth/sign-in', search: { email } });
    },
    onError(res) {
      toast.error(res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Xác thực email' },
  });

  const resendVerifyZodFormProps = createZodFormProps({
    schema: authContract.resendVerify.body,
    defaultValues: {
      email: email ?? '',
    },
    contractAPI: (body) => clientAPI.Auth.resendVerify({ body }),
    displayOptions: {
      email: { label: 'Email' },
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Đã gửi lại email xác thực.');
    },
    onError(res) {
      toast.error(res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Gửi lại mã xác thực' },
  });

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Xác thực email</CardTitle>
          <CardDescription>Nhập mã xác thực đã được gửi đến email của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <ZodForm {...verifyEmailZodFormProps} />
        </CardContent>
        <CardFooter className='justify-center'>
          <Link to='/auth/sign-in' className='text-sm text-primary hover:underline'>
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Chưa nhận được mã?</CardTitle>
          <CardDescription>Nhập email để gửi lại mã xác thực</CardDescription>
        </CardHeader>
        <CardContent>
          <ZodForm {...resendVerifyZodFormProps} />
        </CardContent>
      </Card>
    </div>
  );
}
