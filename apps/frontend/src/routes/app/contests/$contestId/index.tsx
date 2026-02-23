import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/app/contests/$contestId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { contestId } = Route.useParams();

  return (
    <div className='px-4 lg:px-6'>
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết kỳ thi</CardTitle>
          <CardDescription>Thông tin kỳ thi #{contestId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  );
}
