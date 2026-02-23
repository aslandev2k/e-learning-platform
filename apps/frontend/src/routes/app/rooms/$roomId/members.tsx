import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/app/rooms/$roomId/members')({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();

  return (
    <div className='px-4 lg:px-6'>
      <Card>
        <CardHeader>
          <CardTitle>Thành viên phòng học</CardTitle>
          <CardDescription>Danh sách thành viên phòng học #{roomId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  );
}
