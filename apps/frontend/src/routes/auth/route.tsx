import { createFileRoute, Outlet } from '@tanstack/react-router';
import AppFooter from '@/components/common/app-footer';
import AppHeader from '@/routes/-layout/-components/app-header';

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppHeader />
      <div className='max-w-md mx-auto pt-16'>
        <Outlet />
      </div>
      <AppFooter />
    </>
  );
}
