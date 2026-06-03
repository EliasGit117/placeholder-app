import { type FC, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Separator } from '@/components/ui/separator';
import { IconDeviceFloppy, IconFilePlus, IconPlus, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import {
  emptyOption,
  productOptionFormSchema,
  type TProductOptionForm,
} from '../product-editor';


const FORM_ID = 'product-option-form';

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the sheet edits this option; otherwise it creates a new one. */
  option?: TProductOptionForm | null;
  loading?: boolean;
  onSubmit: (values: TProductOptionForm) => void;
}

export const OptionSheet: FC<IProps> = ({ open, onOpenChange, option, loading, onSubmit }) => {
  const isEdit = !!option;

  const form = useForm<TProductOptionForm>({
    resolver: zodResolver(productOptionFormSchema),
    defaultValues: emptyOption(),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'values' });

  useEffect(() => {
    if (!open) return;
    form.reset(option ?? emptyOption());
  }, [open, option]);

  const handleOpenChange = (value: boolean) => {
    if (loading || value) return;
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEdit ? m['pages.products.options.edit_title']() : m['pages.products.options.create_title']()}
          </SheetTitle>
          <SheetDescription>{m['pages.products.form.section_options_description']()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} className="px-4 py-1">
            <fieldset disabled={loading} className="space-y-4">
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <Controller
                  name="key"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>{m['pages.products.form.options.key']()}</FieldLabel>
                      <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                  )}
                />
                <Controller
                  name="nameRo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>{m['pages.products.form.options.name_ro']()}</FieldLabel>
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
                      <FieldLabel>{m['pages.products.form.options.name_ru']()}</FieldLabel>
                      <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Separator/>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FieldLabel>{m['pages.products.form.options.values']()}</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={m['pages.products.form.options.add_value']()}
                    onClick={() => append({ value: '', nameRo: '', nameRu: '' })}
                  >
                    <IconPlus className="size-4"/>
                  </Button>
                </div>

                {fields.map((valueField, valueIndex) => (
                  <div key={valueField.id} className="relative rounded-lg border p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-2 right-2 text-muted-foreground"
                      disabled={fields.length <= 1}
                      onClick={() => remove(valueIndex)}
                    >
                      <IconX className="size-4"/>
                    </Button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <Controller
                        name={`values.${valueIndex}.value`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>{m['pages.products.form.options.value_machine']()}</FieldLabel>
                            <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                          </Field>
                        )}
                      />
                      <Controller
                        name={`values.${valueIndex}.nameRo`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>{m['pages.products.form.options.name_ro']()}</FieldLabel>
                            <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                          </Field>
                        )}
                      />
                      <Controller
                        name={`values.${valueIndex}.nameRu`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>{m['pages.products.form.options.name_ru']()}</FieldLabel>
                            <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
