import { ErrorCode } from '@repo/zod-schemas/src/api/error.schema';
import type { authContract } from '@repo/zod-schemas/src/api-contract/auth.contract';
import type { Role } from '@repo/zod-schemas/src/entity/user-schema';
import { type Permission, roleToPermissions } from '@repo/zod-schemas/src/permission';
import { redirect } from '@tanstack/react-router';
import type { ExtractApiContract } from '@/@type/helper';
import { clientAPI } from '@/config/clientAPI.config';
import { createQueryRepository } from '@/repositories/-factory';
import { throw503Error } from '@/routes/error/503';

type ApiContract = ExtractApiContract<typeof authContract.getMe>;
type ResponseData = ApiContract['responseData'];
const mapToDTO = (data: ResponseData) => {
  return {
    ...data,
    permissions: roleToPermissions(data.role),
  };
};
export type CurrentUserDTO = ReturnType<typeof mapToDTO>;

const defaultData = mapToDTO({
  id: 0,
  email: 'admin@elp.local',
  displayName: 'Admin',
  role: 'ADMIN' as Role,
  status: 'ACTIVE' as const,
  emailVerified: true,
  createdAt: new Date(),
});

export const currentUserRepository = createQueryRepository<CurrentUserDTO>({
  queryKey: () => ['user'],
  queryFn: async () => {
    const res = await clientAPI.Auth.getMe();
    if (res.success) return mapToDTO(res.data);
    if (res.errorCode === ErrorCode.ServiceUnavailable) throw503Error();
    throw redirect({ to: '/auth/sign-out', search: { relativePath: window.location.pathname } });
  },
  defaultData,
});

export const requirePermission = async (permission: Permission) => {
  const { permissions } = await currentUserRepository().loader();
  if (!permissions.has(permission))
    throw redirect({ to: '/app/error/403', mask: { to: '.', unmaskOnReload: true } });
};
