import { createFileRoute, redirect } from '@tanstack/react-router';
import NotFound from '@/components/page-status/not-found';

export const throw404Error = () => {
  throw redirect({ to: '/app/error/404', mask: { to: '.', unmaskOnReload: true } });
};

export const Route = createFileRoute('/app/error/404')({
  component: RouteComponent,
});

function RouteComponent() {
  return <NotFound />;
}
