import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/app/admin/users/$userId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();

  return (
    <div className='px-4 lg:px-6'>
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết người dùng</CardTitle>
          <CardDescription>Thông tin chi tiết người dùng #{userId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  );
}
