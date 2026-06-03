import { type FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TOptions } from '@/features/products/schemas/option-schema.ts';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';


const variantDialogSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  optionValues: z.record(z.string(), z.string()),
});

export type TVariantDialogValues = z.infer<typeof variantDialogSchema>;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: TOptions;
  /** When set, the dialog edits this variant; otherwise it creates a new one. */
  variant?: TProductVariant | null;
  loading?: boolean;
  onSubmit: (values: TVariantDialogValues) => void;
}

export const VariantDialog: FC<IProps> = ({ open, onOpenChange, options, variant, loading, onSubmit }) => {
  const isEdit = !!variant;
  const optionKeys = Object.keys(options);

  const form = useForm<TVariantDialogValues>({
    resolver: zodResolver(variantDialogSchema),
    defaultValues: { nameRo: '', nameRu: '', price: 0, stock: 0, optionValues: {} },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(variant
      ? {
          nameRo: variant.nameRo,
          nameRu: variant.nameRu,
          price: variant.price,
          stock: variant.stock,
          optionValues: { ...variant.optionValues },
        }
      : { nameRo: '', nameRu: '', price: 0, stock: 0, optionValues: {} });
  }, [open, variant]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? m['pages.products.variants.edit_title']() : m['pages.products.variants.add_title']()}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? m['pages.products.variants.edit_description']() : m['pages.products.variants.add_description']()}
          </DialogDescription>
        </DialogHeader>

        <form id="variant-dialog-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Controller
              name="nameRo"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.name_ro']()}</FieldLabel>
                  <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name="nameRu"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.name_ru']()}</FieldLabel>
                  <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.price']()}</FieldLabel>
                  <NumberInput
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? 0)}
                    min={0}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name="stock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.stock']()}</FieldLabel>
                  <NumberInput value={field.value} onValueChange={(v) => field.onChange(v ?? 0)} min={0}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </div>

          {optionKeys.length > 0 && (
            <div className="space-y-2">
              <FieldLabel>{m['pages.products.form.variants.attributes']()}</FieldLabel>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {optionKeys.map((key) => {
                  const option = options[key];
                  return (
                    <Controller
                      key={key}
                      name={`optionValues.${key}`}
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={option.labelRo || key}/>
                            </SelectTrigger>
                            <SelectContent>
                              {option.values.map((v) => (
                                <SelectItem key={v.value} value={v.value}>
                                  {v.labelRo || v.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {m['common.cancel']()}
          </Button>
          <LoadingButton type="submit" form="variant-dialog-form" loading={loading}>
            <IconDeviceFloppy className="size-4"/>
            <span>{m['common.save']()}</span>
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
