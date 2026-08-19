import { type FC, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconBasketCheck, IconBuildingStore, IconCash, IconMapPin, IconSelector, IconTruckDelivery } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { m } from '@/paraglide/messages';
import { client } from '@/lib/orpc';
import { useCartContext } from '@/providers/cart.tsx';
import { DeliveryMethod } from '~/prisma/generated/prisma/enums.ts';

const pickupAddresses = [
  'Bulevardul Ștefan cel Mare 1, Chișinău',
  'Strada Ismail 33, Chișinău',
  'Bulevardul Dacia 55, Chișinău',
];

const schema = z.object({
  paymentType: z.enum(['cash']),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().min(1).email(),
  deliveryMethod: z.enum(['courier', 'pickup']),
  pickupAddress: z.string().optional(),
  address: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === 'pickup' && !data.pickupAddress) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'REQUIRED', path: ['pickupAddress'] });
  }

  if (data.deliveryMethod === 'courier' && !data.address) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'REQUIRED', path: ['address'] });
  }
});

type TSchema = z.infer<typeof schema>;

export const PaymentForm: FC = () => {
  const navigate = useNavigate();
  const { items, clear } = useCartContext();

  const form = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentType: 'cash',
      fullName: '',
      phone: '',
      email: '',
      deliveryMethod: 'courier',
      pickupAddress: '',
      address: '',
    },
  });

  const deliveryMethod = form.watch('deliveryMethod');

  const createOrderMutation = useMutation({
    mutationFn: (data: TSchema) => client.orders.create({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      deliveryMethod: data.deliveryMethod === 'pickup' ? DeliveryMethod.PICKUP : DeliveryMethod.COURIER,
      address: (data.deliveryMethod === 'pickup' ? data.pickupAddress : data.address)!,
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
                    options={[{ value: 'cash', label: m['pages.checkout.payment.payment_type_cash'](), icon: <IconCash/> }]}
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
                      onChange={field.onChange}
                      options={[
                        { value: 'courier', label: m['pages.checkout.payment.delivery_courier'](), icon: <IconTruckDelivery/> },
                        { value: 'pickup', label: m['pages.checkout.payment.delivery_pickup'](), icon: <IconBuildingStore/> },
                      ]}
                    />
                  </Field>
                )}
              />

              {deliveryMethod === 'pickup' ? (
                <Controller
                  name="pickupAddress"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-pickup-address">{m['pages.checkout.payment.pickup_address']()}</FieldLabel>
                      <DropdownField
                        id="checkout-pickup-address"
                        value={field.value}
                        onChange={field.onChange}
                        options={pickupAddresses.map((address) => ({ value: address, label: address, icon: <IconMapPin/> }))}
                      />
                    </Field>
                  )}
                />
              ) : (
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
                    </Field>
                  )}
                />
              )}
            </FieldGroup>

            <LoadingButton type="submit" size="lg" loading={form.formState.isSubmitting} disabled={disabled}>
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
}

const DropdownField: FC<IDropdownFieldProps> = ({ id, value, onChange, options }) => {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" id={id} className="w-full justify-between font-normal">
          <span className="flex min-w-0 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            {selected?.icon}
            <span className="truncate">{selected?.label}</span>
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
