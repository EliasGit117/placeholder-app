import { type FC, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconDots, IconPackage, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { VariantDialog, type TVariantDialogValues } from './variant-dialog.tsx';
import type { TOptionSchema } from '@/features/products/schemas/option-schema.ts';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';


interface IProps {
  productId: number;
  optionSchema: TOptionSchema;
  variants: TProductVariant[];
  canUpdate?: boolean;
}

export const VariantsManager: FC<IProps> = ({ productId, optionSchema, variants, canUpdate }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [dialogOpen, setDialogOpen] = useState(false);
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
      setDialogOpen(false);
      void invalidate();
    },
    onError,
  });

  const { mutate: updateVariant, isPending: isUpdating } = useMutation({
    ...orpc.admin.products.updateVariant.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.products.variants.update_success']());
      setDialogOpen(false);
      void invalidate();
    },
    onError,
  });

  const { mutate: deleteVariant } = useMutation({
    ...orpc.admin.products.deleteVariant.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.products.variants.delete_success']());
      void invalidate();
    },
    onError,
  });

  const onAddClick = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const onEditClick = (variant: TProductVariant) => {
    setEditing(variant);
    setDialogOpen(true);
  };

  const onDeleteClick = async (variant: TProductVariant) => {
    const confirmed = await confirm({
      title: m['pages.products.variants.delete_title'](),
      description: m['pages.products.variants.delete_description'](),
      confirmText: m['common.delete'](),
      cancelText: m['common.cancel'](),
      confirmButton: { variant: 'destructive' },
    });
    if (!confirmed) return;
    deleteVariant({ id: variant.id });
  };

  const onSubmit = (values: TVariantDialogValues) => {
    if (editing)
      updateVariant({ id: editing.id, ...values });
    else
      addVariant({ productId, ...values });
  };

  const attributeBadges = (variant: TProductVariant) =>
    Object.entries(variant.attributes).map(([key, value]) => {
      const option = optionSchema[key];
      const label = option?.labelRo ?? key;
      const valueLabel = option?.values.find(v => v.value === value)?.labelRo ?? value;
      return (
        <Badge key={key} variant="secondary" className="rounded-sm">
          <span className="text-muted-foreground">{label}:</span>&nbsp;{valueLabel}
        </Badge>
      );
    });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canUpdate && (
          <Button variant="outline" size="sm" onClick={onAddClick}>
            <IconPlus className="size-4"/>
            <span>{m['pages.products.variants.add']()}</span>
          </Button>
        )}
      </div>

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
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm font-medium truncate">{variant.nameRo}</div>
                <div className="flex flex-wrap items-center gap-1">{attributeBadges(variant)}</div>
              </div>

              <div className="text-right text-xs text-muted-foreground shrink-0">
                <div>{m['pages.products.variants.stock_short']()}: {variant.stock}</div>
              </div>

              {canUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-xs" variant="ghost">
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
                      disabled={variants.length <= 1}
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

      <VariantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        optionSchema={optionSchema}
        variant={editing}
        loading={isAdding || isUpdating}
        onSubmit={onSubmit}
      />
    </div>
  );
};
