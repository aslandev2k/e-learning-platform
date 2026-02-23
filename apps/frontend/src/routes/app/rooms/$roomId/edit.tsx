import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/app/rooms/$roomId/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();

  return (
    <div className='px-4 lg:px-6'>
      <Card>
        <CardHeader>
          <CardTitle>Cập nhật phòng học</CardTitle>
          <CardDescription>Chỉnh sửa thông tin phòng học #{roomId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  );
}
