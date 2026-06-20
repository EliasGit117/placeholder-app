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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconDots, IconPackage, IconPencil, IconPhoto, IconPhotoOff, IconPlus, IconTrash } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { VariantSheet, type TVariantSheetValues } from './variant-sheet.tsx';
import { VariantImagesSheet } from './variant-images-sheet';
import { getProductStateOption } from '../product-editor';
import { capitalizeFirst, thumbhashToDataUrl } from '@/lib/utils';
import type { TOptions } from '@/features/products/schemas/option-schema.ts';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';
import type { TProductVariantImageDto } from '@/features/products/dtos/product-variant-image.ts';


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

  const [imagesOpen, setImagesOpen] = useState(false);
  const [imagesVariant, setImagesVariant] = useState<TProductVariant | null>(null);

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

  const onManageImagesClick = (variant: TProductVariant) => {
    setImagesVariant(variant);
    setImagesOpen(true);
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

  const locale = getLocale();
  const capitalizedLocale = capitalizeFirst(locale);

  const optionValueBadges = (variant: TProductVariant) =>
    Object.entries(variant.optionValues).map(([key, value]) => {
      const option = options[key];
      const label = option[`name${capitalizedLocale}`] ?? key;
      const matched = option?.values.find(v => v.value === value);
      const valueLabel = matched?.[`name${capitalizedLocale}`] ?? value;

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
            <Button variant="secondary" size="sm" onClick={onAddClick}>
              <IconPlus className="size-4"/>
              <span>{m['common.create']()}</span>
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {variants.length === 0 ? (
          <Empty className="border border-dashed rounded-md py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon"><IconPackage/></EmptyMedia>
              <EmptyTitle>{m['pages.products.variants.empty_title']()}</EmptyTitle>
              <EmptyDescription>{m['pages.products.variants.empty_description']()}</EmptyDescription>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">{m['common.id']()}</TableHead>
                  <TableHead>{m['pages.products.variants.col_name']()}</TableHead>
                  <TableHead>{m['pages.products.variants.sku']()}</TableHead>
                  <TableHead>{m['pages.products.variants.col_price']()}</TableHead>
                  <TableHead>{m['pages.products.variants.col_options']()}</TableHead>
                  <TableHead>{m['pages.products.variants.col_state']()}</TableHead>
                  <TableHead className="w-28">{m['pages.products.variants.col_images']()}</TableHead>
                  {canUpdate && <TableHead className="w-12"/>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {variants.map((variant) => {
                  const opt = getProductStateOption(variant.state);
                  const Icon = opt.icon;
                  return (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{variant.id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate">
                          {variant[`name${capitalizedLocale}`]}
                        </span>
                      </TableCell>
                      <TableCell className='text-xs'>
                        {variant.sku}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm tabular-nums">{variant.price}</span>
                        <small className="text-muted-foreground ml-1">MDL</small>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">{optionValueBadges(variant)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-sm shrink-0">
                          <Icon size={12}/>
                          <span>{opt.label()}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <VariantThumbs images={variant.images}/>
                      </TableCell>
                      {canUpdate && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon-xs" variant="ghost">
                                <IconDots/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-fit min-w-36" align="end">
                              <DropdownMenuItem onClick={() => onManageImagesClick(variant)}>
                                <IconPhoto className="mr-2 size-4"/>
                                <span>{m['pages.products.variants.images.manage']()}</span>
                              </DropdownMenuItem>

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
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <VariantSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          options={options}
          variant={editing}
          loading={isAdding || isUpdating}
          onSubmit={onSubmit}
        />

        <VariantImagesSheet
          open={imagesOpen}
          onOpenChange={setImagesOpen}
          variant={imagesVariant}
        />
      </CardContent>
    </Card>
  );
};

const MAX_THUMBS = 3;

function VariantThumbs({ images }: { images: TProductVariantImageDto[] }) {
  if (images.length === 0)
    return (
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-sm border bg-muted text-muted-foreground">
        <IconPhotoOff className="size-4"/>
      </div>
    );

  return (
    <div className="flex items-center gap-1">
      {images.slice(0, MAX_THUMBS).map((image) => {
        const placeholder = thumbhashToDataUrl(image.thumbhash);
        return (
          <div
            key={image.id}
            className="size-9 shrink-0 overflow-hidden rounded-sm border bg-muted bg-cover bg-center"
            style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
          >
            <img
              src={image.variants.thumb256?.url ?? image.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
