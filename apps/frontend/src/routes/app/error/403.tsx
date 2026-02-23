import { createFileRoute, redirect } from '@tanstack/react-router';
import Forbiden from '@/components/page-status/forbiden';
import { usePageName } from '@/hooks/use-page-name';

export const throw403Error = () => {
  throw redirect({ to: '/app/error/403', mask: { to: '.', unmaskOnReload: true } });
};

export const Route = createFileRoute('/app/error/403')({
  component: RouteComponent,
});

function RouteComponent() {
  const { maskedPageName } = usePageName();

  return <Forbiden pageName={maskedPageName} />;
}
