import { createFileRoute } from '@tanstack/react-router';
import UIError from '@/components/page-status/ui-error';

export const Route = createFileRoute('/app/error/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <UIError />;
}
