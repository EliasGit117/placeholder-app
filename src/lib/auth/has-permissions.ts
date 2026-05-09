import { authClient } from '@/lib/auth/better-auth-client.ts';


type HasPermissionParams = Parameters<typeof authClient.admin.hasPermission>[0];
type AdminPermissionsSet = HasPermissionParams['permissions'];

export async function roleHasPermission(role: string | null | undefined, permissions: AdminPermissionsSet) {
  if (!role)
    return false;

  return authClient.admin.hasPermission({
    permissions: permissions,
    // @ts-ignore
    role: role
  });
}