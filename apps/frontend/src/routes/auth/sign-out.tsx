import { createFileRoute, redirect } from '@tanstack/react-router';
import { clientAPI } from '@/config/clientAPI.config';
import { queryClient } from '@/config/query-client.config';
import clientCookie from '@/lib/client-cookie';
import { currentUserRepository } from '@/repositories/currentUser.repository';

export const Route = createFileRoute('/auth/sign-out')({
  loader: async () => {
    const email = currentUserRepository().get()?.email;
    clientAPI.Auth.logout();
    clientCookie.clear();
    queryClient.clear();
    await queryClient.invalidateQueries({ queryKey: [] });
    throw redirect({
      to: '/auth/sign-in',
      replace: true,
      search: (prev) => ({ ...prev, email }),
    });
  },
});
