import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
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
import { IconChevronDown } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { orpc } from '@/lib/orpc';
import { CategorySelectDropdown } from '@/routes/admin/categories/-components/category-sheet/category-select-dropdown.tsx';
import { getProductStateOption, productStateOptions } from './product-state.ts';


export const ProductFormFields: FC = () => {
  const { control } = useFormContext();

  const { data: forest } = useQuery(orpc.admin.categories.getForest.queryOptions());

  return (
    <FieldGroup className="@container grid grid-cols-2 gap-2 @sm:gap-4">
      <Controller
        name="categoryId"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full">
            <FieldLabel>{m['pages.products.form.category']()}</FieldLabel>
            <CategorySelectDropdown
              forest={forest ?? []}
              value={field.value ?? null}
              onValueChange={(value) => field.onChange(value)}
              placeholder={m['pages.products.form.category_none']()}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="slug"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full @sm:col-span-1">
            <FieldLabel>{m['pages.products.form.slug']()}</FieldLabel>
            <Input {...field} value={field.value ?? ''} autoComplete="off" placeholder='some-product-slug'/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="state"
        control={control}
        render={({ field }) => {
          const current = getProductStateOption(field.value);
          const CurrentIcon = current.icon;
          return (
            <Field className="col-span-full @sm:col-span-1">
              <FieldLabel>{m['common.status']()}</FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CurrentIcon className="text-muted-foreground" size={16}/>
                    <span>{current.label()}</span>
                    <IconChevronDown className="ml-auto opacity-50" size={16}/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                  <DropdownMenuRadioGroup value={field.value ?? ''} onValueChange={field.onChange}>
                    {productStateOptions.map(({ value, label, icon: Icon }) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        <Icon className="text-muted-foreground" size={16}/>
                        <span>{label()}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
          );
        }}
      />

      <Controller
        name="nameRo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full @sm:col-span-1">
            <FieldLabel>{m['pages.products.form.name_ro']()}</FieldLabel>
            <Input {...field} value={field.value ?? ''} autoComplete="off"/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="nameRu"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full @sm:col-span-1">
            <FieldLabel>{m['pages.products.form.name_ru']()}</FieldLabel>
            <Input {...field} value={field.value ?? ''} autoComplete="off"/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="shortDescriptionRo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full @md:col-span-1">
            <FieldLabel>{m['pages.products.form.short_description_ro']()}</FieldLabel>
            <Textarea {...field} value={field.value ?? ''} rows={3}/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="shortDescriptionRu"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full @md:col-span-1">
            <FieldLabel>{m['pages.products.form.short_description_ru']()}</FieldLabel>
            <Textarea {...field} value={field.value ?? ''} rows={3}/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />
    </FieldGroup>
  );
};
