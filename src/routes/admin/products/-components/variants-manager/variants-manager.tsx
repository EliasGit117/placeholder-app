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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconDots, IconPackage, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { VariantSheet, type TVariantSheetValues } from './variant-sheet.tsx';
import { getProductStateOption } from '../product-editor';
import type { TOptions } from '@/features/products/schemas/option-schema.ts';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';


interface IProps {
  productId: number;
  options: TOptions;
  variants: TProductVariant[];
  canUpdate?: boolean;
}

export const VariantsManager: FC<IProps> = ({ productId, options, variants, canUpdate }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TProductVariant | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });

  const onError = (error: unknown) => {
    const message = error instanceof Error ? error.message : m['common.error']();
    toast.error(m['common.error'](), { description: message });
  };

  const { mutate: addVariant, isPending: isAdding } = useMutation({
    ...orpc.admin.products.addVariant.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.products.variants.add_success']());
      setSheetOpen(false);
      void invalidate();
    },
    onError
  });

  const { mutate: updateVariant, isPending: isUpdating } = useMutation({
    ...orpc.admin.products.updateVariant.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.products.variants.update_success']());
      setSheetOpen(false);
      void invalidate();
    },
    onError
  });

  const { mutate: deleteVariant } = useMutation({
    ...orpc.admin.products.deleteVariant.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.products.variants.delete_success']());
      void invalidate();
    },
    onError
  });

  const onAddClick = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const onEditClick = (variant: TProductVariant) => {
    setEditing(variant);
    setSheetOpen(true);
  };

  const onDeleteClick = async (variant: TProductVariant) => {
    const confirmed = await confirm({
      title: m['pages.products.variants.delete_title'](),
      description: m['pages.products.variants.delete_description'](),
      confirmText: m['common.delete'](),
      cancelText: m['common.cancel'](),
      confirmButton: { variant: 'destructive' }
    });
    if (!confirmed) return;
    deleteVariant({ id: variant.id });
  };

  const onSubmit = (values: TVariantSheetValues) => {
    // Drop unselected options — variants don't need to cover every option.
    const optionValues = Object.fromEntries(
      Object.entries(values.optionValues).filter(([, v]) => !!v)
    );
    const payload = { ...values, optionValues };

    if (editing)
      updateVariant({ id: editing.id, ...payload });
    else
      addVariant({ productId, ...payload });
  };

  const isRu = getLocale() === 'ru';

  const optionValueBadges = (variant: TProductVariant) =>
    Object.entries(variant.optionValues).map(([key, value]) => {
      const option = options[key];
      const label = (option && (isRu ? option.nameRu : option.nameRo)) ?? key;
      const matched = option?.values.find(v => v.value === value);
      const valueLabel = (matched && (isRu ? matched.nameRu : matched.nameRo)) ?? value;
      return (
        <Badge key={key} variant="secondary" className="rounded-sm">
          <span className="text-muted-foreground">{label}:</span>&nbsp;{valueLabel}
        </Badge>
      );
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m['pages.products.form.section_variants']()}</CardTitle>
        <CardDescription>{m['pages.products.variants.manage_description']()}</CardDescription>
        {canUpdate && (
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={onAddClick}>
              <IconPlus className="size-4"/>
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
      {variants.length === 0 ? (
        <Empty className="border border-dashed rounded-md py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon"><IconPackage/></EmptyMedia>
            <EmptyTitle>{m['pages.products.variants.empty_title']()}</EmptyTitle>
            <EmptyDescription>{m['pages.products.variants.empty_description']()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y rounded-md border">
          {variants.map((variant) => (
            <li key={variant.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-sm font-medium truncate">{isRu ? variant.nameRu : variant.nameRo}</span>
                  <span className="text-xs text-muted-foreground shrink-0">({variant.sku})</span>
                </div>
                {(() => {
                  const opt = getProductStateOption(variant.state);
                  const Icon = opt.icon;
                  return (
                    <Badge variant="outline" className="rounded-sm shrink-0">
                      <Icon size={12}/>
                      <span>{opt.label()}</span>
                    </Badge>
                  );
                })()}
                <div className="flex flex-wrap items-center gap-1">{optionValueBadges(variant)}</div>
              </div>

              {canUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-xs" variant="ghost" className="self-start">
                      <IconDots/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit min-w-36" align="end">
                    <DropdownMenuItem onClick={() => onEditClick(variant)}>
                      <IconPencil className="mr-2 size-4"/>
                      <span>{m['common.edit']()}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteClick(variant)}
                    >
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

        <VariantSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          options={options}
          variant={editing}
          loading={isAdding || isUpdating}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  );
};
