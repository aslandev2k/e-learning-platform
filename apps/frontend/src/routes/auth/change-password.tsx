import { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ZodForm, { createZodFormProps } from '@/components/zod-form/zod-form';
import { clientAPI } from '@/config/clientAPI.config';
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/auth/change-password')({
  component: RouteComponent,
  loader: currentUserRepository().loader,
});

function RouteComponent() {
  const navigate = useNavigate();
  const changePasswordZodFormProps = createZodFormProps({
    schema: authContract.changePassword.body
      .extend({
        newPasswordConfirm: z.string().default(''),
      })
      .refine((data) => data.newPassword === data.newPasswordConfirm, {
        message: 'Mật khẩu mới và mật khẩu xác nhận không khớp',
        path: ['newPasswordConfirm'],
      }),
    defaultValues: {},
    contractAPI: (body) => clientAPI.Auth.changePassword({ body }),
    displayOptions: {
      oldPassword: { label: 'Mật khẩu cũ' },
      newPassword: { label: 'Mật khẩu mới' },
      newPasswordConfirm: { label: 'Xác nhận mật khẩu mới' },
    },
    onSuccess() {
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới!');
      navigate({ to: '/auth/sign-out' });
    },
    onError(res) {
      toast.error(res.message);
    },
    submitBtn: { className: 'w-full mt-4', text: 'Đổi mật khẩu' },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>Vui lòng nhập mật khẩu cũ và mật khẩu mới để đổi mật khẩu</CardDescription>
      </CardHeader>
      <CardContent>
        <ZodForm {...changePasswordZodFormProps} />
      </CardContent>
    </Card>
  );
}
