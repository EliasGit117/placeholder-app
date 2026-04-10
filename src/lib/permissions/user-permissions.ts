import { type TOperationMap } from '@/lib/permissions/operations.ts';


export const userPermissions: TOperationMap = {
  users: [],
  todos: ['list', 'view']
} as const;