import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/auth/forgot-password')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>Nhập email để nhận liên kết đặt lại mật khẩu</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
      </CardContent>
      <CardFooter className='justify-center'>
        <Link to='/auth/sign-in' className='text-sm text-primary hover:underline'>
          Quay lại đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
