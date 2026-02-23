import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/app/profile/')({
  component: RouteComponent,
  loader: currentUserRepository().loader,
});

function RouteComponent() {
  return (
    <div className='px-4 lg:px-6'>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Xem và cập nhật thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  );
}
