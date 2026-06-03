import { forwardRef, useEffect, useState } from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';


export interface NumberInputProps
  extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
  inputSize?: 'default' | 'sm';
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  inputClassName?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper = 1,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      inputSize,
      className,
      inputClassName,
      ...restOfProps
    },
    ref
  ) => {
    const [value, setValue] = useState<number | undefined>(controlledValue ?? defaultValue);

    useEffect(() => {
      setValue(controlledValue);
    }, [controlledValue]);

    const handleIncrement = () =>
      setValue((prev) => prev === undefined ? stepper : Math.min(prev + stepper, max));

    const handleDecrement = () =>
      setValue((prev) => prev === undefined ? -stepper : Math.max(prev - stepper, min));

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      const newValue = values.floatValue ?? undefined;
      setValue(newValue);
      onValueChange?.(newValue);
    };

    const handleBlur = () => {
      if (value !== undefined) {
        let adjusted = value;
        if (value < min) adjusted = min;
        if (value > max) adjusted = max;
        if (adjusted !== value) {
          setValue(adjusted);
          onValueChange?.(adjusted);
        }
      }
    };

    return (
      <div className={cn('flex items-center', className)}>
        <NumericFormat
          value={value ?? ''}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className={cn(
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none',
            '[&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative',
            inputSize === 'sm' && 'h-8',
            inputClassName
          )}
          getInputRef={ref}
          {...restOfProps}
        />

        <div className="flex flex-col">
          <Button
            type='button'
            aria-label="Increase value"
            className={cn(
              'px-2 w-7 h-4 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative',
              inputSize === 'sm' && 'h-4 w-6 py-1'
            )}
            variant="outline"
            onClick={() => {
              handleIncrement();
              onValueChange?.(value);
            }}
            disabled={value === max}
          >
            <IconChevronUp className="text-muted-foreground"/>
          </Button>
          <Button
            type='button'
            aria-label="Decrease value"
            className={cn(
              'px-2 w-7 h-4 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative',
              inputSize === 'sm' && 'h-4 w-6 py-1'
            )}
            variant="outline"
            onClick={() => {
              handleDecrement();
              onValueChange?.(value);
            }}
            disabled={value === min}
          >
            <IconChevronDown className="text-muted-foreground"/>
          </Button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';