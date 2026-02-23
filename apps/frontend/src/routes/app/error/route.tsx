import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/app/error')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='mx-auto'>
      <Outlet />
    </div>
  );
}
