import { type FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { IconDeviceFloppy, IconFilePlus, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import type { TOptions } from '@/features/products/schemas/option-schema.ts';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';


const variantSheetSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  optionValues: z.record(z.string(), z.string()),
});

export type TVariantSheetValues = z.infer<typeof variantSheetSchema>;

const FORM_ID = 'variant-sheet-form';

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: TOptions;
  /** When set, the sheet edits this variant; otherwise it creates a new one. */
  variant?: TProductVariant | null;
  loading?: boolean;
  onSubmit: (values: TVariantSheetValues) => void;
}

export const VariantSheet: FC<IProps> = ({ open, onOpenChange, options, variant, loading, onSubmit }) => {
  const isEdit = !!variant;
  const optionKeys = Object.keys(options);
  const isRu = getLocale() === 'ru';

  const form = useForm<TVariantSheetValues>({
    resolver: zodResolver(variantSheetSchema),
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

  const handleOpenChange = (v: boolean) => {
    if (loading || v) return;
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEdit ? m['pages.products.variants.edit_title']() : m['pages.products.variants.add_title']()}
          </SheetTitle>
          <SheetDescription>
            {isEdit ? m['pages.products.variants.edit_description']() : m['pages.products.variants.add_description']()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} className="px-4 py-1">
            <fieldset disabled={loading}>
              <FieldGroup className="gap-4">
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
                        <NumberInput value={field.value} onValueChange={(v) => field.onChange(v ?? 0)} min={0}/>
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
                        const optionLabel = (isRu ? option.labelRu : option.labelRo) || key;
                        return (
                          <Controller
                            key={key}
                            name={`optionValues.${key}`}
                            control={form.control}
                            render={({ field }) => (
                              <Field>
                                <FieldLabel>{optionLabel}</FieldLabel>
                                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder={optionLabel}/>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {option.values.map((v) => (
                                      <SelectItem key={v.value} value={v.value}>
                                        {(isRu ? v.labelRu : v.labelRo) || v.value}
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
              </FieldGroup>
            </fieldset>
          </form>
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={loading}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton form={FORM_ID} className="grow sm:min-w-32 sm:grow-0" loading={loading}>
              {isEdit ? <IconDeviceFloppy/> : <IconFilePlus/>}
              <span>{isEdit ? m['common.save']() : m['common.create']()}</span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
