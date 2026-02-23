import { createFileRoute, Outlet } from '@tanstack/react-router';
import { currentUserRepository } from '@/repositories/currentUser.repository';
import AppSidebarLayout from '@/routes/-layout/app-sidebar.layout';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  loader: currentUserRepository().loader,
});

function RouteComponent() {
  return (
    <AppSidebarLayout>
      <Outlet />
    </AppSidebarLayout>
  );
}
