import { allOperations, type TOperationMap } from '@/lib/permissions/operations.ts';


export const adminPermissions: TOperationMap = {
  users: allOperations,
  todos: allOperations
} as const;