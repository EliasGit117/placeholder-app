import type { FC } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconPlus, IconTrash, IconStack2 } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { emptyOption } from './schemas.ts';


export const OptionSchemaEditor: FC = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <Empty className="border border-dashed rounded-md py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon"><IconStack2/></EmptyMedia>
            <EmptyTitle>{m['pages.products.form.options.empty_title']()}</EmptyTitle>
            <EmptyDescription>{m['pages.products.form.options.empty_description']()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {fields.map((optionField, optionIndex) => (
        <div key={optionField.id} className="rounded-md border p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Controller
              name={`options.${optionIndex}.key`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.options.key']()}</FieldLabel>
                  <Input {...field} value={field.value ?? ''} placeholder="color" autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name={`options.${optionIndex}.labelRo`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.options.label_ro']()}</FieldLabel>
                  <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name={`options.${optionIndex}.labelRu`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{m['pages.products.form.options.label_ru']()}</FieldLabel>
                  <Input {...field} value={field.value ?? ''} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </div>

          <Separator/>

          <OptionValues optionIndex={optionIndex}/>

          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(optionIndex)}>
              <IconTrash className="size-4"/>
              <span>{m['pages.products.form.options.remove_option']()}</span>
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => append(emptyOption())}>
        <IconPlus className="size-4"/>
        <span>{m['pages.products.form.options.add']()}</span>
      </Button>
    </div>
  );
};

const OptionValues: FC<{ optionIndex: number }> = ({ optionIndex }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `options.${optionIndex}.values` });

  return (
    <div className="space-y-2">
      <FieldLabel>{m['pages.products.form.options.values']()}</FieldLabel>

      {fields.map((valueField, valueIndex) => (
        <div key={valueField.id} className="flex items-end gap-2">
          <div className="grid flex-1 grid-cols-3 gap-2">
            <Controller
              name={`options.${optionIndex}.values.${valueIndex}.value`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} value={field.value ?? ''} placeholder={m['pages.products.form.options.value_machine']()} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name={`options.${optionIndex}.values.${valueIndex}.labelRo`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} value={field.value ?? ''} placeholder={m['pages.products.form.options.label_ro']()} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
            <Controller
              name={`options.${optionIndex}.values.${valueIndex}.labelRu`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} value={field.value ?? ''} placeholder={m['pages.products.form.options.label_ru']()} autoComplete="off"/>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                </Field>
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={fields.length <= 1}
            onClick={() => remove(valueIndex)}
          >
            <IconTrash className="size-4"/>
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ value: '', labelRo: '', labelRu: '' })}
      >
        <IconPlus className="size-4"/>
        <span>{m['pages.products.form.options.add_value']()}</span>
      </Button>
    </div>
  );
};
