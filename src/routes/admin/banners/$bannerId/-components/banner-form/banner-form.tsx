import { type FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { Separator } from '@/components/ui/separator';
import { m } from '@/paraglide/messages';
import { BannerState, BannerStyle, BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';
import { updateBannerDtoSchema, type TUpdateBannerDto } from '@/features/banners/dtos/update-banner.ts';
import type { TBannerDto } from '@/features/banners/dtos/banner.ts';
import { bannerDevices } from '@/features/banners/consts/banner-devices.ts';
import { BannerStateSelect } from './banner-state-select.tsx';
import { BannerDeviceCard } from './banner-device-card.tsx';
import { BannerFormSkeleton } from './banner-form-skeleton.tsx';


interface IProps {
  id: number;
  // Optional pre-fetched banner (e.g. SSR) to seed the query so the form renders
  // immediately without a client round-trip.
  initialData?: TBannerDto;
}

// Maps a banner (or nothing) to form values. Nullable text becomes '' for
// controlled inputs; alignment falls back to the schema defaults.
function toFormValues(banner?: TBannerDto): TUpdateBannerDto {
  return {
    state: banner?.state ?? BannerState.ACTIVE,
    titleRo: banner?.titleRo ?? '',
    titleRu: banner?.titleRu ?? '',
    descriptionRo: banner?.descriptionRo ?? '',
    descriptionRu: banner?.descriptionRu ?? '',
    href: banner?.href ?? '',
    mobileXAlign: banner?.mobileXAlign ?? BannerXAlign.LEFT,
    mobileYAlign: banner?.mobileYAlign ?? BannerYAlign.CENTER,
    tabletXAlign: banner?.tabletXAlign ?? BannerXAlign.LEFT,
    tabletYAlign: banner?.tabletYAlign ?? BannerYAlign.CENTER,
    desktopXAlign: banner?.desktopXAlign ?? BannerXAlign.LEFT,
    desktopYAlign: banner?.desktopYAlign ?? BannerYAlign.CENTER,
    mobileStyle: banner?.mobileStyle ?? BannerStyle.LIGHT,
    tabletStyle: banner?.tabletStyle ?? BannerStyle.LIGHT,
    desktopStyle: banner?.desktopStyle ?? BannerStyle.LIGHT,
  };
}

export const BannerForm: FC<IProps> = ({ id, initialData }) => {
  const queryClient = useQueryClient();

  const { data: banner, isLoading } = useQuery({
    ...orpc.admin.banners.getById.queryOptions({ input: { id } }),
    initialData: initialData
  });

  const form = useForm<TUpdateBannerDto>({
    resolver: zodResolver(updateBannerDtoSchema),
    defaultValues: toFormValues(banner)
  });

  useEffect(() => {
    if (!banner)
      return;

    form.reset(toFormValues(banner));
  }, [banner]);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (values: TUpdateBannerDto) =>
      orpc.admin.banners.update.call({ params: { id }, body: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getById.queryKey({ input: { id } }) });
      await queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() });
      toast.success(m['pages.banners.detail.saved']());
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    }
  });

  const onSubmit = (values: TUpdateBannerDto) => {
    save({
      ...values,
      // Empty optional text means "unset" — store null, not ''.
      titleRo: values.titleRo?.trim() || null,
      titleRu: values.titleRu?.trim() || null,
      descriptionRo: values.descriptionRo?.trim() || null,
      descriptionRu: values.descriptionRu?.trim() || null,
      href: values.href?.trim() || null
    });
  };

  const disabled = isSaving || isLoading;

  // No SSR seed and the query is still in flight — show the skeleton.
  if (isLoading && !banner)
    return <BannerFormSkeleton/>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="@container space-y-6">
          <fieldset disabled={disabled} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-3">
              {bannerDevices.map((device) => (
                <BannerDeviceCard
                  key={device}
                  bannerId={id}
                  device={device}
                  form={form}
                  disabled={disabled}
                />
              ))}
            </div>

            <Separator/>

            <FieldGroup className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
              <Controller
                name="titleRo"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-full">
                    <FieldLabel>{m['pages.banners.detail.field_title_ro']()}</FieldLabel>
                    <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  </Field>
                )}
              />
              <Controller
                name="titleRu"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-full">
                    <FieldLabel>{m['pages.banners.detail.field_title_ru']()}</FieldLabel>
                    <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  </Field>
                )}
              />
              <Controller
                name="descriptionRo"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-full">
                    <FieldLabel>{m['pages.banners.detail.field_description_ro']()}</FieldLabel>
                    <Textarea {...field} value={field.value ?? ''} rows={3}/>
                  </Field>
                )}
              />
              <Controller
                name="descriptionRu"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-full">
                    <FieldLabel>{m['pages.banners.detail.field_description_ru']()}</FieldLabel>
                    <Textarea {...field} value={field.value ?? ''} rows={3}/>
                  </Field>
                )}
              />
              <Controller
                name="href"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="w-full" data-invalid={fieldState.invalid}>
                    <FieldLabel>{m['pages.banners.detail.field_href']()}</FieldLabel>
                    <Input {...field} value={field.value ?? ''} autoComplete="off"
                           placeholder="products/some-product-22"/>
                  </Field>
                )}
              />
              <Controller
                name="state"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-full">
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
        </CardContent>

        <CardFooter className="justify-end">
          <LoadingButton type="submit" loading={isSaving} disabled={disabled}>
            {m['common.save']()}
          </LoadingButton>
        </CardFooter>
      </Card>
    </form>
  );
};
