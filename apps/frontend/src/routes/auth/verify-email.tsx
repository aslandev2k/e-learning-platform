import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/auth/verify-email')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
    email: z.string().optional().catch(undefined),
  }),
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xác thực email</CardTitle>
        <CardDescription>Vui lòng kiểm tra email để xác thực tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>Chức năng đang được phát triển...</p>
      </CardContent>
    </Card>
  );
}
