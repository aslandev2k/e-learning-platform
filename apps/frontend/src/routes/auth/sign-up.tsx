import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
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
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/auth/sign-up')({
  component: RouteComponent,
  loader: async () => {
    const user = await currentUserRepository()
      .loader()
      .catch(() => undefined);
    if (user) throw redirect({ to: '/app' });
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const signUpZodFormProps = createZodFormProps({
    schema: authContract.register.body
      .extend({
        passwordConfirm: z.string().default(''),
      })
      .refine((data) => data.password === data.passwordConfirm, {
        message: 'Mật khẩu và mật khẩu xác nhận không khớp',
        path: ['passwordConfirm'],
      }),
    defaultValues: {
      role: 'STUDENT' as const,
    },
    contractAPI: (body) => clientAPI.Auth.register({ body }),
    displayOptions: {
      displayName: { label: 'Tên hiển thị' },
      email: { label: 'Email' },
      role: {
        label: 'Vai trò',
        selectOptions: [
          { value: 'STUDENT', label: 'Học sinh' },
          { value: 'TEACHER', label: 'Giáo viên' },
        ],
      },
      password: { label: 'Mật khẩu' },
      passwordConfirm: { label: 'Xác nhận mật khẩu' },
    },
    onSuccess: (data) => {
      toast.success(
        data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      );
      navigate({ to: '/auth/sign-in' });
    },
    onError(res) {
      toast.error(res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Đăng ký' },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
        <CardDescription>
          Tạo tài khoản mới để truy cập hệ thống luyện tập lập trình
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ZodForm {...signUpZodFormProps} />
      </CardContent>
      <CardFooter className='justify-center'>
        <Link to='/auth/sign-in' className='text-sm text-primary hover:underline'>
          Đã có tài khoản? Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
