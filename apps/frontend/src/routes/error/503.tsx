import { createFileRoute, redirect } from '@tanstack/react-router';
import ServiceUnavailable from '@/components/page-status/service-unavailable';

export const throw503Error = () => {
  throw redirect({ to: '/error/503', mask: { to: '.', unmaskOnReload: true } });
};

export const Route = createFileRoute('/error/503')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ServiceUnavailable />;
}
