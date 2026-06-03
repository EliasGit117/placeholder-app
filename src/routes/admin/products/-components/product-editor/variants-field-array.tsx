import type { FC } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { emptyVariant, type TProductOptionForm } from './schemas.ts';


export const VariantsFieldArray: FC = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const options = (useWatch({ control, name: 'options' }) ?? []) as TProductOptionForm[];
  const isRu = getLocale() === 'ru';

  // Only options with a machine key and at least one usable value can drive an attribute picker.
  const usableOptions = options.filter(o => o.key && o.values.some(v => v.value));

  return (
    <div className="space-y-3">
      {fields.map((variantField, index) => (
        <div key={variantField.id} className="rounded-md border p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Controller
              name={`variants.${index}.nameRo`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.name_ro']()}</FieldLabel>
                  <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name={`variants.${index}.nameRu`}
              control={control}
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
              name={`variants.${index}.price`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.price']()}</FieldLabel>
                  <NumberInput
                    min={0}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? 0)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name={`variants.${index}.stock`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.variants.stock']()}</FieldLabel>
                  <NumberInput value={field.value} onValueChange={(v) => field.onChange(v ?? 0)} min={0}/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </div>

          {usableOptions.length > 0 && (
            <div className="space-y-2">
              <FieldLabel>{m['pages.products.form.variants.attributes']()}</FieldLabel>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {usableOptions.map((option) => {
                  const optionLabel = (isRu ? option.labelRu : option.labelRo) || option.key;
                  return (
                    <Controller
                      key={option.key}
                      name={`variants.${index}.optionValues.${option.key}`}
                      control={control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>{optionLabel}</FieldLabel>
                          <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={optionLabel}/>
                            </SelectTrigger>
                            <SelectContent>
                              {option.values.filter(v => v.value).map((v) => (
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

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={fields.length <= 1}
              onClick={() => remove(index)}
            >
              <IconTrash className="size-4"/>
              <span>{m['pages.products.form.variants.remove']()}</span>
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant())}>
        <IconPlus className="size-4"/>
        <span>{m['pages.products.form.variants.add']()}</span>
      </Button>
    </div>
  );
};
