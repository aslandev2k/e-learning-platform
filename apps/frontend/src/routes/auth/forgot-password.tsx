import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
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

export const Route = createFileRoute('/auth/forgot-password')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const forgotPasswordZodFormProps = createZodFormProps({
    schema: authContract.forgotPassword.body,
    defaultValues: {},
    contractAPI: (body) => clientAPI.Auth.forgotPassword({ body }),
    displayOptions: {
      email: { label: 'Email' },
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
      navigate({ to: '/auth/sign-in' });
    },
    onError(res) {
      toast.error(res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Gửi liên kết đặt lại' },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>Nhập email để nhận liên kết đặt lại mật khẩu</CardDescription>
      </CardHeader>
      <CardContent>
        <ZodForm {...forgotPasswordZodFormProps} />
      </CardContent>
      <CardFooter className='justify-center'>
        <Link to='/auth/sign-in' className='text-sm text-primary hover:underline'>
          Quay lại đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
