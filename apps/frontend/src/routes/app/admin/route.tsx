import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Role } from '@repo/zod-schemas/src/entity/user-schema';
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/app/admin')({
  component: RouteComponent,
  loader: async () => {
    const user = await currentUserRepository().loader();
    if (user.role !== Role.ADMIN) {
      throw redirect({ to: '/app/error/403', mask: { to: '.', unmaskOnReload: true } });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
