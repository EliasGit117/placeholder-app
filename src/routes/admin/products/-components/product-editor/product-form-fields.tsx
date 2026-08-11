import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { RichEditor } from '@/components/rich-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { IconChevronDown, IconWand } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { orpc } from '@/lib/orpc';
import { CategorySelectDropdown } from '@/routes/admin/categories/-components/category-sheet/category-select-dropdown.tsx';
import { slugifyValue } from '@/features/products/common/lib/slug.ts';
import { getProductStateOption, productStateOptions } from './product-state.ts';


interface IProps {
  // Native inputs are disabled via the wrapping <fieldset>, but the TipTap
  // editor is contenteditable (not a form control) so it needs this explicitly.
  disabled?: boolean;
}

export const ProductFormFields: FC<IProps> = ({ disabled }) => {
  const { control, setValue, getValues } = useFormContext();

  const { data: forest, isPending: isForestPending } = useQuery(orpc.admin.categories.getForest.queryOptions());

  const onGenerateSlug = () =>
    setValue('slug', slugifyValue(getValues('nameRo')), { shouldValidate: true, shouldDirty: true });

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
              loading={isForestPending}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
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
        name="slug"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full @sm:col-span-1">
            <FieldLabel>{m['pages.products.form.slug']()}</FieldLabel>
            <InputGroup>
              <InputGroupInput {...field} value={field.value ?? ''} autoComplete="off" placeholder='some-product-slug'/>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={onGenerateSlug}
                  aria-label={m['pages.products.form.variants.generate']()}
                  title={m['pages.products.form.variants.generate']()}
                >
                  <IconWand/>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
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

      <Field className="col-span-full">
        <FieldLabel>{m['pages.products.form.short_description']()}</FieldLabel>
        <Tabs defaultValue="ro">
          <TabsList>
            <TabsTrigger value="ro">RO</TabsTrigger>
            <TabsTrigger value="ru">RU</TabsTrigger>
          </TabsList>

          <TabsContent value="ro">
            <Controller
              name="shortDescriptionRo"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea {...field} value={field.value ?? ''} disabled={disabled} rows={3}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </TabsContent>

          <TabsContent value="ru">
            <Controller
              name="shortDescriptionRu"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea {...field} value={field.value ?? ''} disabled={disabled} rows={3}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </TabsContent>
        </Tabs>
      </Field>

      <Field className="col-span-full">
        <FieldLabel>{m['pages.products.form.description']()}</FieldLabel>
        <Tabs defaultValue="ro">
          <TabsList>
            <TabsTrigger value="ro">RO</TabsTrigger>
            <TabsTrigger value="ru">RU</TabsTrigger>
          </TabsList>

          <TabsContent value="ro">
            <Controller
              name="descriptionRo"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <RichEditor value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </TabsContent>

          <TabsContent value="ru">
            <Controller
              name="descriptionRu"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <RichEditor value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </TabsContent>
        </Tabs>
      </Field>
    </FieldGroup>
  );
};
