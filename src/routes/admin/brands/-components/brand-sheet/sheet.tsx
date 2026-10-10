import { type FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconDeviceFloppy, IconFilePlus, IconX } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
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
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { m } from '@/paraglide/messages';
import { createBrandDtoSchema, type TCreateBrandDto } from '@/features/brands/admin/dtos/create-brand.ts';
import { BrandSheetMode, useBrandSheet } from './provider.tsx';


const formId = 'brand-form';

export const BrandSheet: FC = () => {
  const { isOpen, options, close } = useBrandSheet();
  const queryClient = useQueryClient();
  const isUpdate = options?.mode === BrandSheetMode.Update;
  const brand = options?.mode === BrandSheetMode.Update ? options.brand : undefined;

  const form = useForm<TCreateBrandDto>({
    resolver: zodResolver(createBrandDtoSchema),
    defaultValues: { nameRo: '', nameRu: '' },
  });

  useEffect(() => {
    if (isOpen)
      form.reset({ nameRo: brand?.nameRo ?? '', nameRu: brand?.nameRu ?? '' });
  }, [isOpen, brand]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (values: TCreateBrandDto) =>
      brand
        ? orpc.admin.brands.update.call({ params: { id: brand.id }, body: values })
        : orpc.admin.brands.create.call(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orpc.admin.brands.search.key() }),
        queryClient.invalidateQueries({ queryKey: orpc.admin.brands.getAll.key() }),
      ]);
      toast.success(isUpdate ? m['pages.brands.sheet.update_success']() : m['pages.brands.sheet.create_success']());
      close();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    },
  });

  const onOpenChange = (value: boolean) => {
    if (isPending || value)
      return;

    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {isUpdate ? m['pages.brands.sheet.edit_title']() : m['pages.brands.sheet.create_title']()}
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? m['pages.brands.sheet.edit_description']() : m['pages.brands.sheet.create_description']()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <form id={formId} onSubmit={form.handleSubmit((values) => save(values))} className="px-4 py-1">
            <fieldset disabled={isPending}>
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="nameRo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-full sm:col-span-1" data-invalid={fieldState.invalid}>
                      <FieldLabel>{m['pages.brands.sheet.name_ro']()}</FieldLabel>
                      <Input {...field} autoComplete="off"/>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                  )}
                />
                <Controller
                  name="nameRu"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-full sm:col-span-1" data-invalid={fieldState.invalid}>
                      <FieldLabel>{m['pages.brands.sheet.name_ru']()}</FieldLabel>
                      <Input {...field} autoComplete="off"/>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                  )}
                />
              </FieldGroup>
            </fieldset>
          </form>
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isPending}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton form={formId} className="grow sm:min-w-32 sm:grow-0" loading={isPending}>
              {isUpdate ? <IconDeviceFloppy/> : <IconFilePlus/>}
              <span>{isUpdate ? m['common.save']() : m['common.create']()}</span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
