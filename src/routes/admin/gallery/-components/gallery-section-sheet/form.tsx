import { type ComponentProps, type FC } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { IconChevronDown, IconEye, IconEyeOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';
import type { TCreateGallerySectionDto } from '@/features/gallery-sections/dtos/create-gallery-section.ts';
import type { TUpdateGallerySectionDto } from '@/features/gallery-sections/dtos/update-gallery-section.ts';


interface IProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  id?: string;
  form: UseFormReturn<TCreateGallerySectionDto | TUpdateGallerySectionDto>;
  onSubmit: (data: TCreateGallerySectionDto | TUpdateGallerySectionDto) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const GallerySectionForm: FC<IProps> = ({
  id = 'gallery-section-form',
  form,
  onSubmit,
  disabled,
  loading,
  ...formProps
}) => {
  if (loading)
    return (
      <form id={id} {...formProps}>
        <LoadingSkeleton/>
      </form>
    );

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} {...formProps}>
      <fieldset disabled={disabled}>
        <FieldGroup className="grid grid-cols-2 gap-2 sm:gap-4">

          <Controller
            name="nameRo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>{m['pages.gallery_sections.index.sheet.name_ro']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="nameRu"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>{m['pages.gallery_sections.index.sheet.name_ru']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="state"
            control={form.control}
            render={({ field }) => (
              <Field className="col-span-full">
                <FieldLabel>{m['common.status']()}</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {field.value === GallerySectionState.active
                        ? <IconEye className="text-muted-foreground" size={16}/>
                        : <IconEyeOff className="text-muted-foreground" size={16}/>}
                      <span>
                        {field.value === GallerySectionState.active
                          ? m['pages.gallery_sections.index.sheet.state_active']()
                          : m['pages.gallery_sections.index.sheet.state_hidden']()}
                      </span>
                      <IconChevronDown className="ml-auto opacity-50" size={16}/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={field.value ?? ''} onValueChange={field.onChange}>
                      <DropdownMenuRadioItem value={GallerySectionState.active}>
                        <IconEye className="text-muted-foreground" size={16}/>
                        <span>{m['pages.gallery_sections.index.sheet.state_active']()}</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={GallerySectionState.hidden}>
                        <IconEyeOff className="text-muted-foreground" size={16}/>
                        <span>{m['pages.gallery_sections.index.sheet.state_hidden']()}</span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            )}
          />

          <Controller
            name="descriptionRo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full">
                <FieldLabel>
                  {m['pages.gallery_sections.index.sheet.description_ro']()}
                </FieldLabel>
                <Textarea {...field} value={field.value ?? ''} rows={3}/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="descriptionRu"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full">
                <FieldLabel>
                  {m['pages.gallery_sections.index.sheet.description_ru']()}
                </FieldLabel>
                <Textarea {...field} value={field.value ?? ''} rows={3}/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

        </FieldGroup>
      </fieldset>
    </form>
  );
};

const LoadingSkeleton: FC = () => (
  <div className="grid grid-cols-2 gap-2 sm:gap-4">
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-16 w-full"/>
    </div>
    <div className="col-span-full">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-16 w-full"/>
    </div>
  </div>
);
