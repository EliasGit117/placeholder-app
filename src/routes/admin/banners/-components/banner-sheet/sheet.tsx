import { type FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { m } from '@/paraglide/messages';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';
import { createBannerDtoSchema, type TCreateBannerInput } from '@/features/banners/dtos/create-banner.ts';
import { BannerStateSelect } from '../../$bannerId/-components/banner-form/banner-state-select.tsx';
import { useBannerSheet } from './provider.tsx';


const formId = 'banner-create-form';

function getDefaults(): TCreateBannerInput {
  return {
    state: BannerState.ACTIVE,
    titleRo: '',
    titleRu: '',
    href: '',
  };
}

export const BannerSheet: FC = () => {
  const { isOpen, close } = useBannerSheet();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openAfterCreation, setOpenAfterCreation] = useState(true);

  const form = useForm<TCreateBannerInput>({
    resolver: zodResolver(createBannerDtoSchema),
    defaultValues: getDefaults(),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaults());
      setOpenAfterCreation(true);
    }
  }, [isOpen]);

  const { mutate: create, isPending } = useMutation({
    mutationFn: (values: TCreateBannerInput) =>
      orpc.admin.banners.create.call({
        ...values,
        titleRo: values.titleRo?.trim() || null,
        titleRu: values.titleRu?.trim() || null,
        href: values.href?.trim() || null,
      }),
    onSuccess: async (banner) => {
      await queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() });
      close();
      if (openAfterCreation)
        void navigate({ to: '/admin/banners/$bannerId', params: { bannerId: banner.id } });
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
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{m['pages.banners.sheet.create_title']()}</SheetTitle>
          <SheetDescription>{m['pages.banners.sheet.create_description']()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <form id={formId} onSubmit={form.handleSubmit((values) => create(values))} className="px-4 py-1">
            <fieldset disabled={isPending}>
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="titleRo"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="col-span-full sm:col-span-1">
                      <FieldLabel>{m['pages.banners.detail.field_title_ro']()}</FieldLabel>
                      <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                    </Field>
                  )}
                />
                <Controller
                  name="titleRu"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="col-span-full sm:col-span-1">
                      <FieldLabel>{m['pages.banners.detail.field_title_ru']()}</FieldLabel>
                      <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                    </Field>
                  )}
                />
                <Controller
                  name="href"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-full sm:col-span-1" data-invalid={fieldState.invalid}>
                      <FieldLabel>{m['pages.banners.detail.field_href']()}</FieldLabel>
                      <Input {...field} value={field.value ?? ''} autoComplete="off" placeholder="products/some-product-22"/>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                  )}
                />
                <Controller
                  name="state"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="col-span-full sm:col-span-1">
                      <FieldLabel>{m['common.status']()}</FieldLabel>
                      <BannerStateSelect
                        value={field.value ?? BannerState.ACTIVE}
                        onChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </fieldset>
          </form>
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 pt-0">
          <div className="flex items-center gap-2 w-full">
            <Checkbox
              id="banner-open-after-creation"
              checked={openAfterCreation}
              onCheckedChange={(value) => setOpenAfterCreation(value === true)}
              disabled={isPending}
            />
            <Label htmlFor="banner-open-after-creation" className="font-normal flex-1">
              {m['pages.banners.sheet.open_after_creation']()}
            </Label>
          </div>

          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isPending}>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton form={formId} className="grow sm:min-w-32 sm:grow-0" loading={isPending}>
              <span>{m['common.create']()}</span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
