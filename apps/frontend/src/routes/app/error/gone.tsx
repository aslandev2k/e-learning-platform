import { createFileRoute, redirect } from '@tanstack/react-router';
import Gone from '@/components/page-status/gone';
import { usePageName } from '@/hooks/use-page-name';

export const throwGoneError = () => {
  throw redirect({ to: '/app/error/gone', mask: { to: '.', unmaskOnReload: true } });
};

export const Route = createFileRoute('/app/error/gone')({
  component: RouteComponent,
});

function RouteComponent() {
  const { maskedPageName } = usePageName();

  return <Gone pageName={maskedPageName} />;
}
