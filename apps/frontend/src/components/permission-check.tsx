import type { Permission } from '@repo/zod-schemas/src/permission';
import type { PropsWithChildren } from 'react';
import { currentUserRepository } from '@/repositories/currentUser.repository';

const PermissionCheck = ({
  permission,
  children,
}: PropsWithChildren<{ permission: Permission }>) => {
  const {
    data: { permissions },
  } = currentUserRepository().useQuery();
  const allowed = permissions.has(permission);

  if (allowed) return children;
  return null;
};

export default PermissionCheck;
