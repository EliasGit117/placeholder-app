import { type ComponentProps, type FC } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { m } from '@/paraglide/messages';
import { cn, objectKeys } from '@/lib/utils';
import type { TCreateCategoryForm, TUpdateCategoryForm } from './schemas.ts';
import type { TCategoryTreeNode } from '@/features/categories/schemas/category.ts';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';
import { CategorySelectDropdown } from './category-select-dropdown.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconSelector } from '@tabler/icons-react';
import { CategoryStateIcon } from '@/components/icons';


interface IProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  id?: string;
  form: UseFormReturn<TCreateCategoryForm | TUpdateCategoryForm>;
  onSubmit: (data: TCreateCategoryForm | TUpdateCategoryForm) => void;
  disabled?: boolean;
  loading?: boolean;
  forest?: TCategoryTreeNode[];
  currentCategoryId?: number;
}

export const CategoryForm: FC<IProps> = ({
                                           id = 'category-form',
                                           form,
                                           onSubmit,
                                           disabled,
                                           loading,
                                           forest = [],
                                           currentCategoryId,
                                           className,
                                           ...formProps
                                         }) => {
  if (loading)
    return (
      <form id={id} className={className} {...formProps}>
        <LoadingSkeleton/>
      </form>
    );

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className={className} {...formProps}>
      <fieldset disabled={disabled}>
        <FieldGroup className="grid grid-cols-2 gap-2 sm:gap-4">

          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full">
                <FieldLabel>{m['pages.categories.index.sheet.slug']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} placeholder="electronica" className="font-mono"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="nameRo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>{m['pages.categories.index.sheet.name_ro']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} placeholder="Electronică"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="nameRu"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>{m['pages.categories.index.sheet.name_ru']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} placeholder="Электроника"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="parentId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>
                  {m['pages.categories.index.sheet.parent_category']()}
                </FieldLabel>
                <CategorySelectDropdown
                  value={field.value ?? null}
                  onValueChange={(v) => field.onChange(v)}
                  forest={forest}
                  excludeId={currentCategoryId}
                  disabled={disabled}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="state"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="col-span-full sm:col-span-1"
              >
                <FieldLabel>{m['common.status']()}</FieldLabel>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start gap-2">
                      <CategoryStateIcon status={field.value} className="text-muted-foreground"/>
                      {field.value === CategoryState.active && m['pages.categories.index.sheet.state_active']()}
                      {field.value === CategoryState.hidden && m['pages.categories.index.sheet.state_hidden']()}
                      {!field.value && <span>{m['common.selected_none']()}</span>}
                      <IconSelector className="ml-auto text-muted-foreground"/>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                    <DropdownMenuGroup>
                      <DropdownMenuRadioGroup value={field.value} onValueChange={v => field.onChange(v)}>
                        {objectKeys(CategoryState).map(state => (
                          <DropdownMenuRadioItem value={state}>
                            <CategoryStateIcon status={state} className='text-muted-foreground'/>
                            <span>{m[`pages.categories.index.sheet.state_${state}`]()}</span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]}/>
                )}
              </Field>
            )}
          />

          <Controller
            name="descriptionRo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>
                  {m['pages.categories.index.sheet.description_ro']()}
                </FieldLabel>
                <Textarea {...field} value={field.value ?? ''}/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="descriptionRu"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>
                  {m['pages.categories.index.sheet.description_ru']()}
                </FieldLabel>
                <Textarea {...field} value={field.value ?? ''}/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

        </FieldGroup>
      </fieldset>
    </form>
  );
};

const LoadingSkeleton: FC<ComponentProps<'div'>> = ({ className }) => (
  <div className={cn('grid grid-cols-2 gap-2 sm:gap-4', className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="col-span-full sm:col-span-1">
        <Skeleton className="mb-2 h-4 w-24"/>
        <Skeleton className="h-9 w-full"/>
      </div>
    ))}
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-16"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full">
      <Skeleton className="mb-2 h-4 w-36"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-20"/>
      <Skeleton className="h-9 w-full"/>
    </div>
  </div>
);
