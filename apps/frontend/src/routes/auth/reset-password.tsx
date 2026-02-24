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

export const Route = createFileRoute('/auth/reset-password')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();

  const resetPasswordZodFormProps = createZodFormProps({
    schema: authContract.resetPassword.body
      .extend({
        newPasswordConfirm: z.string().default(''),
      })
      .refine((data) => data.newPassword === data.newPasswordConfirm, {
        message: 'Mật khẩu mới và mật khẩu xác nhận không khớp',
        path: ['newPasswordConfirm'],
      }),
    defaultValues: {
      token: token ?? '',
    },
    contractAPI: (body) => clientAPI.Auth.resetPassword({ body }),
    displayOptions: {
      token: { label: 'Mã xác thực', hidden: !!token },
      newPassword: { label: 'Mật khẩu mới' },
      newPasswordConfirm: { label: 'Xác nhận mật khẩu mới' },
    },
    onSuccess: (data) => {
      toast.success(
        data.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
      );
      navigate({ to: '/auth/sign-in' });
    },
    onError(res) {
      toast.error(res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Đặt lại mật khẩu' },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đặt lại mật khẩu</CardTitle>
        <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <ZodForm {...resetPasswordZodFormProps} />
      </CardContent>
      <CardFooter className='justify-center'>
        <Link to='/auth/sign-in' className='text-sm text-primary hover:underline'>
          Quay lại đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
