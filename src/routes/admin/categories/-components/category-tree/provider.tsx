import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import type { ICategoryTreeNodeDto } from '@/features/categories/admin/dtos/category-tree.ts';
import {
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  syncDataLoaderFeature,
  type TreeInstance,
  type TreeState,
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { getLocale } from '@/paraglide/runtime';

const locale = getLocale();

const getLocaleName = (node: ICategoryTreeNodeDto): string =>
  locale === 'ru' ? node.nameRu : node.nameRo;

const ROOT_ID = '__root__';

const fallbackNode = (_id: string): ICategoryTreeNodeDto => ({
  id: 0,
  nameRo: '…',
  nameRu: '…',
  descriptionRo: null,
  descriptionRu: null,
  state: 'ACTIVE' as ICategoryTreeNodeDto['state'],
  slug: '',
  path: '/',
  parentId: null,
  createdAt: '',
  updatedAt: '',
  children: [],
});

const rootSentinel: ICategoryTreeNodeDto = {
  ...fallbackNode(ROOT_ID),
  nameRo: 'Categorii',
  nameRu: 'Категории',
};

interface ICategoryTreeContext {
  tree: TreeInstance<ICategoryTreeNodeDto>;
  indent: number;
  disabled: boolean;
  isEmpty: boolean;
  isPending: boolean;
  searchValue: string;
  setSearchValue: (v: string) => void;
  filteredIds: Set<string> | null;
  deleteCategory: (id: number) => Promise<void>;
  refetch: () => void;
}

const [CategoryTreeContext, useCategoryTree] = contextFactory<ICategoryTreeContext>({ name: 'CategoryTreeContext' });

const indent = 20;

export const CategoryTreeProvider = ({ children, disabled }: PropsWithChildren<{ disabled?: boolean }>) => {
  const { data: forest, isPending, refetch } = useQuery({
    ...orpc.admin.categories.getForest.queryOptions(),
    staleTime: 60_000,
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => orpc.admin.categories.delete.call({ id }),
    onSuccess: () => refetch(),
  });

  const [state, setState] = useState<Partial<TreeState<ICategoryTreeNodeDto>>>({});
  const [searchValue, setSearchValue] = useState('');

  // Flat map: id → node (built by traversing the nested forest)
  const nodeMap = useMemo(() => {
    const map = new Map<string, ICategoryTreeNodeDto>();
    map.set(ROOT_ID, { ...rootSentinel, children: forest ?? [] });

    const traverse = (nodes: ICategoryTreeNodeDto[]) => {
      for (const node of nodes) {
        map.set(String(node.id), node);
        if (node.children.length) traverse(node.children);
      }
    };

    traverse(forest ?? []);
    return map;
  }, [forest]);

  const isDisabled = isPending || isDeleting || !!disabled;

  const tree = useTree<ICategoryTreeNodeDto>({
    indent,
    rootItemId: ROOT_ID,
    state,
    setState,
    features: [
      ...(!disabled ? [hotkeysCoreFeature] : []),
      syncDataLoaderFeature,
      searchFeature,
      expandAllFeature,
    ],
    dataLoader: {
      getItem: (id) => nodeMap.get(id) ?? fallbackNode(id),
      getChildren: (id) => (nodeMap.get(id)?.children ?? []).map(c => String(c.id)),
    },
    getItemName: (item) => getLocaleName(item.getItemData()),
    isItemFolder: (item) => item.getItemData().children.length > 0,
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [nodeMap]);

  const filteredIds = useMemo(() => {
    if (!searchValue.trim()) return null;

    const allItems = tree.getItems();
    if (!allItems.length) return null;

    const q = searchValue.toLowerCase();
    const directMatches = allItems.filter(it => it.getItemName().toLowerCase().includes(q)).map(it => it.getId());
    const visible = new Set<string>(directMatches);

    for (const matchId of directMatches) {
      let item = allItems.find(i => i.getId() === matchId);
      while (item?.getParent?.()) {
        const parent = item.getParent?.();
        if (!parent) break;
        visible.add(parent.getId());
        item = parent;
      }
    }

    for (const matchId of directMatches) {
      const root = allItems.find(i => i.getId() === matchId);
      if (!root?.isFolder()) continue;
      const stack = [...root.getChildren()];
      while (stack.length) {
        const child = stack.pop()!;
        visible.add(child.getId());
        if (child.isFolder()) stack.push(...child.getChildren());
      }
    }

    return visible;
  }, [searchValue, tree.getItems().length]);

  useEffect(() => {
    if (searchValue.trim()) tree.expandAll();
  }, [searchValue]);

  return (
    <CategoryTreeContext.Provider
      value={{
        tree,
        indent,
        disabled: isDisabled,
        isEmpty: !forest || forest.length === 0,
        isPending,
        searchValue,
        setSearchValue,
        filteredIds,
        deleteCategory: (id) => deleteMutation(id),

        refetch,
      }}
    >
      {children}
    </CategoryTreeContext.Provider>
  );
};

export { CategoryTreeContext, useCategoryTree };
