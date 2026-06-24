import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { IconRefresh } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import {
  CategorySheetMode,
  CategorySheetProvider,
  CategorySheetTrigger,
} from './-components/category-sheet/index.ts';
import { CategorySheet } from './-components/category-sheet/sheet.tsx';
import {
  CategoryTree,
  CategoryTreeProvider,
  CategoryTreeToolbar,
  useCategoryTree,
} from './-components/category-tree/index.ts';
import type { FC } from 'react';
import { AdaptiveButton } from '@/components/ui/adaptive-button.tsx';


export const Route = createFileRoute('/admin/categories/')({
  staticData: { crumbs: { title: () => m['pages.categories.title']() } },
  component: RouteComponent,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { categories: ['list'] });
    if (!canList)
      throw redirect({ to: '/', replace: true });

    const [canCreate, canUpdate, canDelete] = await Promise.all([
      roleHasPermission(user?.role, { categories: ['create'] }),
      roleHasPermission(user?.role, { categories: ['update'] }),
      roleHasPermission(user?.role, { categories: ['delete'] }),
    ]);

    return { canCreate, canUpdate, canDelete };
  }
});


function RouteComponent() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({
    queryKey: orpc.admin.categories.getForest.queryOptions().queryKey,
  });

  return (
    <CategorySheetProvider>
      <CategoryTreeProvider>
        <main className="flex flex-1 flex-col gap-4">
          <CategoryTreeToolbar>
            <ToolbarActions onSuccess={invalidate}/>
          </CategoryTreeToolbar>

          <CategoryTree/>
        </main>

        <CategorySheet onSuccess={invalidate}/>
      </CategoryTreeProvider>
    </CategorySheetProvider>
  );
}


const ToolbarActions: FC<{ onSuccess: () => void }> = ({ onSuccess: _ }) => {
  const { canCreate } = Route.useRouteContext();
  const { refetch, disabled } = useCategoryTree();

  return (
    <div className="ml-auto flex items-center gap-1">
      {canCreate && (
        <CategorySheetTrigger
          disabled={disabled}
          breakpoint='lg'
          options={{ mode: CategorySheetMode.Create }}
          variant="ghost"
          size="sm"
        />
      )}

      <AdaptiveButton
        text={m['common.refresh']()}
        breakpoint='lg'
        variant='ghost'
        icon={IconRefresh}
        onClick={() =>refetch()}
        disabled={disabled}
        size='sm'
      />
    </div>
  );
};
