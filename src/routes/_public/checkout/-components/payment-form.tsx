import { type FC, type ReactNode } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconBasketCheck, IconBuildingStore, IconCash, IconCreditCard, IconSelector, IconTruckDelivery } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { m } from '@/paraglide/messages';
import { client } from '@/lib/orpc';
import { useCartContext } from '@/providers/cart.tsx';
import { DeliveryMethod } from '~/prisma/generated/prisma/enums.ts';
import { PaymentType } from '@/features/orders/common/constants.ts';

// Schema messages are codes, translated at render time so they follow the active locale.
const REQUIRED = 'REQUIRED';
const INVALID_EMAIL = 'INVALID_EMAIL';

export const checkoutFormSchema = z.object({
  paymentType: z.enum(PaymentType),
  fullName: z.string().min(1, REQUIRED),
  phone: z.string().min(1, REQUIRED),
  email: z.string().min(1, REQUIRED).email(INVALID_EMAIL),
  deliveryMethod: z.enum(DeliveryMethod),
  address: z.string().optional(),
  acceptTerms: z.boolean().refine((value) => value),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === DeliveryMethod.COURIER && !data.address) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: REQUIRED, path: ['address'] });
  }
});

export type TCheckoutFormSchema = z.infer<typeof checkoutFormSchema>;
export type TDeliveryMethod = TCheckoutFormSchema['deliveryMethod'];

export const checkoutFormDefaultValues: TCheckoutFormSchema = {
  paymentType: PaymentType.CASH,
  fullName: '',
  phone: '',
  email: '',
  deliveryMethod: DeliveryMethod.COURIER,
  address: '',
  acceptTerms: false,
};

export const PaymentForm: FC = () => {
  const navigate = useNavigate();
  const { items, clear } = useCartContext();
  const form = useFormContext<TCheckoutFormSchema>();

  // useWatch subscribes this component itself; form.watch() only re-renders the useForm host.
  const deliveryMethod = useWatch({ control: form.control, name: 'deliveryMethod' });
  const acceptTerms = useWatch({ control: form.control, name: 'acceptTerms' });

  const createOrderMutation = useMutation({
    mutationFn: (data: TCheckoutFormSchema) => client.orders.create({
      paymentType: data.paymentType,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      deliveryMethod: data.deliveryMethod,
      address: (data.deliveryMethod === DeliveryMethod.PICKUP ? m['pages.contacts.office.address']() : data.address)!,
    }),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const order = await createOrderMutation.mutateAsync(data);
      clear();

      toast.success(m['pages.checkout.payment.success']());
      void navigate({ to: '/orders/$uid', params: { uid: order.uid } });
    } catch {
      toast.error(m['pages.checkout.payment.error']());
    }
  });

  const disabled = items.length === 0 || form.formState.isSubmitting || createOrderMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m['pages.checkout.payment.title']()}</CardTitle>
        <CardDescription>{m['pages.checkout.payment.description']()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit}>
          <fieldset disabled={disabled} className="flex flex-col gap-5">
            <Controller
              name="paymentType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="checkout-payment-type">{m['pages.checkout.payment.payment_type']()}</FieldLabel>
                  <DropdownField
                    id="checkout-payment-type"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: PaymentType.CASH, label: m['pages.checkout.payment.payment_type_cash'](), icon: <IconCash/> },
                      { value: PaymentType.MAIB, label: m['pages.checkout.payment.payment_type_maib'](), icon: <IconCreditCard/> },
                    ]}
                  />
                </Field>
              )}
            />

            <div className="border-t border-dashed"/>

            <FieldGroup className="gap-3">
              <FieldLabel className="text-base font-semibold">{m['pages.checkout.payment.contact_title']()}</FieldLabel>

              <Controller
                name="fullName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="checkout-full-name">{m['common.full_name']()}</FieldLabel>
                    <Input
                      id="checkout-full-name"
                      autoComplete="name"
                      placeholder={m['pages.checkout.payment.full_name_placeholder']()}
                      {...field}
                    />
                    <ValidationError error={fieldState.error}/>
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="checkout-phone">{m['pages.checkout.payment.phone']()}</FieldLabel>
                    <Input
                      id="checkout-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder={m['pages.checkout.payment.phone_placeholder']()}
                      {...field}
                    />
                    <ValidationError error={fieldState.error}/>
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="checkout-email">{m['pages.checkout.payment.email']()}</FieldLabel>
                    <Input
                      id="checkout-email"
                      type="email"
                      autoComplete="email"
                      placeholder={m['pages.checkout.payment.email_placeholder']()}
                      {...field}
                    />
                    <ValidationError error={fieldState.error}/>
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="border-t border-dashed"/>

            <FieldGroup className="gap-3">
              <FieldLabel className="text-base font-semibold">{m['pages.checkout.payment.delivery_title']()}</FieldLabel>

              <Controller
                name="deliveryMethod"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="checkout-delivery-method">{m['pages.checkout.payment.delivery_method']()}</FieldLabel>
                    <DropdownField
                      id="checkout-delivery-method"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value === DeliveryMethod.PICKUP)
                          form.resetField('address');
                      }}
                      options={[
                        { value: DeliveryMethod.COURIER, label: m['pages.checkout.payment.delivery_courier'](), icon: <IconTruckDelivery/> },
                        { value: DeliveryMethod.PICKUP, label: m['pages.checkout.payment.delivery_pickup'](), icon: <IconBuildingStore/> },
                      ]}
                    />
                  </Field>
                )}
              />

              {deliveryMethod === DeliveryMethod.COURIER && (
                <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-address">{m['pages.checkout.payment.address']()}</FieldLabel>
                      <Input
                        id="checkout-address"
                        autoComplete="street-address"
                        placeholder={m['pages.checkout.payment.address_placeholder']()}
                        {...field}
                      />
                      <ValidationError error={fieldState.error}/>
                    </Field>
                  )}
                />
              )}
            </FieldGroup>

            <Controller
              name="acceptTerms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <Checkbox
                    id="checkout-accept-terms"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor="checkout-accept-terms" className="font-normal">
                    <span>
                      {m['pages.checkout.payment.terms_agree']()}{' '}
                      <Link to="/terms" target="_blank" className="underline underline-offset-2 hover:text-primary">
                        {m['pages.terms.title']()}
                      </Link>
                    </span>
                  </FieldLabel>
                </Field>
              )}
            />

            <LoadingButton type="submit" size="lg" className="sm:ml-auto sm:w-fit" loading={form.formState.isSubmitting} disabled={disabled || !acceptTerms}>
              <IconBasketCheck/>
              {m['pages.checkout.payment.submit']()}
            </LoadingButton>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
};

interface IDropdownFieldProps {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: ReactNode }[];
  placeholder?: string;
}

const ValidationError: FC<{ error: { message?: string } | undefined }> = ({ error }) => {
  if (!error)
    return null;

  return (
    <FieldError>
      {error.message === INVALID_EMAIL
        ? m['pages.checkout.payment.validation_invalid_email']()
        : m['pages.checkout.payment.validation_required']()}
    </FieldError>
  );
};

const DropdownField: FC<IDropdownFieldProps> = ({ id, value, onChange, options, placeholder }) => {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" id={id} className="w-full justify-between font-normal">
          <span className="flex min-w-0 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            {selected ? (
              <>
                {selected.icon}
                <span className="truncate">{selected.label}</span>
              </>
            ) : (
              <span className="truncate text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <IconSelector className="size-4 shrink-0 text-muted-foreground"/>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
