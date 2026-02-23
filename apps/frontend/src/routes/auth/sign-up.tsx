import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/auth/sign-up')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
        <CardDescription>
          Tạo tài khoản mới để truy cập hệ thống luyện tập lập trình
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
      </CardContent>
      <CardFooter className='justify-center'>
        <Link to='/auth/sign-in' className='text-sm text-primary hover:underline'>
          Đã có tài khoản? Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
