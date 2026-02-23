import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/app/problems/$problemId/')({
  component: RouteComponent,
  validateSearch: z.object({
    contestId: z.coerce.number().optional().catch(undefined),
  }),
});

function RouteComponent() {
  const { problemId } = Route.useParams();

  return (
    <div className='px-4 lg:px-6'>
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết bài tập</CardTitle>
          <CardDescription>Đề bài #{problemId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  );
}
