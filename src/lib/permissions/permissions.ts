import { UsersRoleOptions } from '@/lib/pocketbase';
import type { TOperation, TOperationMap } from '@/lib/permissions/operations.ts';
import { adminPermissions } from '@/lib/permissions/admin-permissions.ts';
import { userPermissions } from '@/lib/permissions/user-permissions.ts';

export const rolePermissions = {
  admin: adminPermissions,
  user: userPermissions
} satisfies Record<UsersRoleOptions, TOperationMap>;

export type TRole = keyof typeof rolePermissions;

export function roleHasPermission<TResource extends keyof TOperationMap>(role: TRole, resource: TResource, operation: TOperation): boolean {
  const permissionMap = rolePermissions[role];
  if (!permissionMap)
    return false;

  const operationList = permissionMap[resource];
  if (!operationList)
    return false;

  return operationList.includes(operation);
}

roleHasPermission('user', 'todos', 'delete');