import { type FC, useEffect } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Button } from '@/components/ui/button.tsx';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { IconDeviceFloppy, IconFilePlus, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { useCategorySheet, CategorySheetMode } from './provider.tsx';
import { createCategoryFormSchema, updateCategoryFormSchema, type TCreateCategoryForm, type TUpdateCategoryForm } from './schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { CategoryForm } from './form.tsx';
import { toast } from 'sonner';
import type { TCategory, TCategoryTreeNode } from '@/features/categories/schemas/category.ts';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';


interface IProps {
  onSuccess?: () => void;
}

export const CategorySheet: FC<IProps> = ({ onSuccess }) => {
  const { isOpen, options, close } = useCategorySheet();
  const mode = options?.mode;
  const categoryId = options?.mode === CategorySheetMode.Update ? options.categoryId : undefined;
  const defaultParentId = options?.mode === CategorySheetMode.Create ? options.parentId : undefined;


  const form = useForm<TCreateCategoryForm | TUpdateCategoryForm>({
    resolver: zodResolver(mode === CategorySheetMode.Create ? createCategoryFormSchema : updateCategoryFormSchema),
    defaultValues: getFormValues(),
  });

  const { data: forest = [] } = useQuery({
    ...orpc.admin.categories.getForest.queryOptions(),
    staleTime: 60_000,
  });

  const onMutationSuccess = () => {
    onSuccess?.();
    close();
  };

  const onMutationError = (error: unknown) => {
    const message = error instanceof Error ? error.message : m['common.error']();
    toast.error(m['common.error'](), { description: message });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: async (values: TCreateCategoryForm) => {
      return orpc.admin.categories.create.call({ ...values, parentId: values.parentId ?? undefined });
    },
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: async (values: TUpdateCategoryForm) => {
      if (!categoryId) throw new Error('Missing category ID');
      return orpc.admin.categories.update.call({ id: categoryId, ...values, parentId: values.parentId ?? undefined });
    },
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const onOpenChange = (v: boolean) => {
    if (isCreating || isUpdating || v) return;
    close();
  };

  const onSubmit = (values: TCreateCategoryForm | TUpdateCategoryForm) => {
    // null means "cleared by user" — convert to undefined before API call
    const parentId: number | undefined = values.parentId ?? undefined;
    const payload = { ...values, parentId };

    if (mode === CategorySheetMode.Create) {
      const parsed = createCategoryFormSchema.safeParse(payload);
      if (!parsed.success) return;
      create(parsed.data);
      return;
    }
    update(payload as TUpdateCategoryForm);
  };

  const currentCategory = categoryId ? findInForest(forest, categoryId) : undefined;

  useEffect(() => {
    if (!isOpen) return;

    if (mode === CategorySheetMode.Create || currentCategory == null) {
      form.reset(getFormValues(undefined, defaultParentId));
      return;
    }

    form.reset(getFormValues(currentCategory));
  }, [isOpen, mode, currentCategory]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {mode === CategorySheetMode.Update
              ? m['pages.categories.index.sheet.edit_title']()
              : m['pages.categories.index.sheet.create_title']()}
          </SheetTitle>
          <SheetDescription>
            {mode === CategorySheetMode.Update
              ? m['pages.categories.index.sheet.edit_description']()
              : m['pages.categories.index.sheet.create_description']()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <CategoryForm
            id="category-form"
            form={form}
            className="px-4 py-1"
            disabled={isCreating || isUpdating}
            forest={forest}
            currentCategoryId={categoryId}
            onSubmit={onSubmit}
          />
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isCreating || isUpdating}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton
              form="category-form"
              className="grow sm:min-w-32 sm:grow-0"
              loading={isCreating || isUpdating}
            >
              {mode === CategorySheetMode.Create ? <IconFilePlus/> : <IconDeviceFloppy/>}
              <span>{mode === CategorySheetMode.Create ? m['common.create']() : m['common.save']()}</span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};


function findInForest(nodes: TCategoryTreeNode[], id: number): TCategory | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      const { children: _, ...cat } = node;
      return cat;
    }
    const found = findInForest(node.children, id as number);
    if (found) return found;
  }
}

function getFormValues(category?: TCategory, defaultParentId?: number): TCreateCategoryForm | TUpdateCategoryForm {
  return {
    nameRo: category?.nameRo ?? '',
    nameRu: category?.nameRu ?? '',
    descriptionRo: category?.descriptionRo ?? undefined,
    descriptionRu: category?.descriptionRu ?? undefined,
    state: category?.state ?? CategoryState.ACTIVE,
    slug: category?.slug ?? '',
    // Use null as the "no parent" sentinel so react-hook-form can detect
    // clearing (onChange(null)) as an explicit value change, unlike undefined.
    parentId: category?.parentId ?? defaultParentId ?? null,
  };
}
