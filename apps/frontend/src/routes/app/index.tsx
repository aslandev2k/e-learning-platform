import { createFileRoute, redirect } from '@tanstack/react-router';
import { Role } from '@repo/zod-schemas/src/entity/user-schema';
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/app/')({
  loader: async () => {
    const user = await currentUserRepository().loader();

    if (user.role === Role.ADMIN) {
      throw redirect({ to: '/app/admin/users' });
    }

    throw redirect({ to: '/app/rooms' });
  },
});
