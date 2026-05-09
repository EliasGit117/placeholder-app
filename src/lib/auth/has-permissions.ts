import { authClient } from '@/lib/auth/better-auth-client.ts';


type HasPermissionParams = Parameters<typeof authClient.admin.checkRolePermission>[0];
type AdminPermissionsSet = HasPermissionParams['permissions'];

export async function roleHasPermission(role: string | null | undefined, permissions: AdminPermissionsSet) {
  if (!role)
    return false;

  return  authClient.admin.checkRolePermission({
    // @ts-ignore
    role: role,
    permissions: permissions,
  })
}