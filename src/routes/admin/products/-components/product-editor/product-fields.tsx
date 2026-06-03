import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';


export const ProductFields: FC = () => {
  const { control } = useFormContext();

  return (
    <FieldGroup className="grid grid-cols-2 gap-2 sm:gap-4">
      <Controller
        name="nameRo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
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
          <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
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
          <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
            <FieldLabel>{m['pages.products.form.slug']()}</FieldLabel>
            <Input {...field} value={field.value ?? ''} autoComplete="off"/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="state"
        control={control}
        render={({ field }) => (
          <Field className="col-span-full sm:col-span-1">
            <FieldLabel>{m['common.status']()}</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProductState.active}>
                  <IconEye className="text-muted-foreground" size={16}/>
                  <span>{m['pages.products.form.state_active']()}</span>
                </SelectItem>
                <SelectItem value={ProductState.hidden}>
                  <IconEyeOff className="text-muted-foreground" size={16}/>
                  <span>{m['pages.products.form.state_hidden']()}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        name="descriptionRo"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full">
            <FieldLabel>{m['pages.products.form.description_ro']()}</FieldLabel>
            <Textarea {...field} value={field.value ?? ''} rows={3}/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />

      <Controller
        name="descriptionRu"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="col-span-full">
            <FieldLabel>{m['pages.products.form.description_ru']()}</FieldLabel>
            <Textarea {...field} value={field.value ?? ''} rows={3}/>
            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
          </Field>
        )}
      />
    </FieldGroup>
  );
};
