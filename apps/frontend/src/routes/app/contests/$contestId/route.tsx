import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/app/contests/$contestId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
