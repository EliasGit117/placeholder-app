export type TOperation = 'list' | 'view' | 'create' | 'update' | 'delete';
export type TOperationList = readonly TOperation[];

export const allOperations = ['list', 'view', 'create', 'update', 'delete'] as const satisfies readonly TOperation[];

export const operationMap = {
  users: allOperations,
  todos: allOperations
} as const satisfies Record<string, TOperationList>;

export type TResource = keyof typeof operationMap;
export type TOperationMap = Record<TResource, TOperationList>;
