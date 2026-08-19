import { type FC, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconDots, IconPencil, IconPlus, IconStack2, IconTrash } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { OptionSheet } from './option-sheet.tsx';
import { optionsToRecord, recordToOptions, type TProductOptionForm } from '../product-editor';
import type { TOptions } from '@/features/products/common/dtos/option-schema.ts';


interface IProps {
  productId: number;
  options: TOptions;
  canUpdate?: boolean;
  className?: string;
}

export const OptionsManager: FC<IProps> = ({ productId, options, canUpdate, className }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const isRu = getLocale() === 'ru';

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const list = recordToOptions(options);

  const { mutate: saveOptions, isPending } = useMutation({
    mutationFn: (options: TOptions) => orpc.admin.products.update.call({ id: productId, options }),
    onSuccess: (data) => {
      toast.success(m['pages.products.form.save_success']());
      setSheetOpen(false);
      // Seed cache from the mutation response so the new list renders immediately,
      // then revalidate. Without this the list falls back to stale server data
      // during refetch and the just-added item flickers out.
      queryClient.setQueryData(
        orpc.admin.products.get.queryOptions({ input: { id: productId } }).queryKey,
        data
      );
      void queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    }
  });

  const persist = (next: TProductOptionForm[]) =>
    saveOptions(optionsToRecord(next));

  const onAddClick = () => {
    setEditingKey(null);
    setSheetOpen(true);
  };

  const onEditClick = (key: string) => {
    setEditingKey(key);
    setSheetOpen(true);
  };

  const onDeleteClick = async (key: string) => {
    const confirmed = await confirm({
      title: m['pages.products.options.delete_title'](),
      description: m['pages.products.options.delete_description'](),
      confirmText: m['common.delete'](),
      cancelText: m['common.cancel'](),
      confirmButton: { variant: 'destructive' }
    });
    if (!confirmed) return;
    persist(list.filter(o => o.key !== key));
  };

  const onSubmit = (values: TProductOptionForm) => {
    const next = editingKey
      ? list.map(o => (o.key === editingKey ? values : o))
      : [...list, values];

    const keys = next.map(o => o.key);
    if (new Set(keys).size !== keys.length) {
      toast.error(m['pages.products.options.duplicate_key']());
      return;
    }

    persist(next);
  };

  const editingOption = editingKey ? list.find(o => o.key === editingKey) ?? null : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{m['pages.products.form.section_options']()}</CardTitle>
        <CardDescription>{m['pages.products.form.section_options_edit_description']()}</CardDescription>
        {canUpdate && (
          <CardAction>
            <Button variant="secondary" size="sm" onClick={onAddClick}>
              <IconPlus className="size-4"/>
              <span>{m['common.create']()}</span>
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        {list.length === 0 ? (
          <Empty className="border border-dashed rounded-md py-12 h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon"><IconStack2/></EmptyMedia>
              <EmptyTitle>{m['pages.products.form.options.empty_title']()}</EmptyTitle>
              <EmptyDescription>{m['pages.products.form.options.empty_description']()}</EmptyDescription>
            </EmptyHeader>
            {canUpdate && (
              <EmptyContent>
                <Button variant="outline" size="sm" onClick={onAddClick}>
                  <IconPlus className="size-4"/>
                  <span>{m['common.create']()}</span>
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <ul className="divide-y rounded-md border">
            {list.map((option) => (
              <li key={option.key} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-medium truncate">{isRu ? option.nameRu : option.nameRo}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    {option.values.map((v) => (
                      <Badge key={v.value} variant="secondary" className="rounded-sm">
                        {isRu ? v.nameRu : v.nameRo}
                      </Badge>
                    ))}
                  </div>
                </div>

                {canUpdate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-xs" variant="ghost" className="self-start">
                        <IconDots/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-fit min-w-36" align="end">
                      <DropdownMenuItem onClick={() => onEditClick(option.key)}>
                        <IconPencil className="mr-2 size-4"/>
                        <span>{m['common.edit']()}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDeleteClick(option.key)}>
                        <IconTrash className="mr-2 size-4"/>
                        <span>{m['common.delete']()}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            ))}
          </ul>
        )}

        <OptionSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          option={editingOption}
          loading={isPending}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  );
};
