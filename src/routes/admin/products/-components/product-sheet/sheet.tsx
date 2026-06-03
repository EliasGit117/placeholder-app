import { type FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconFilePlus, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { ProductFields } from '../product-editor';
import { useProductSheet } from './provider.tsx';
import { createProductFormSchema, type TCreateProductForm } from './schemas.ts';


const FORM_ID = 'product-create-form';

function getDefaults(): TCreateProductForm {
  return {
    nameRo: '',
    nameRu: '',
    shortDescriptionRo: '',
    shortDescriptionRu: '',
    slug: '',
    state: ProductState.active,
  };
}

export const ProductSheet: FC = () => {
  const { isOpen, close } = useProductSheet();
  const navigate = useNavigate();

  const form = useForm<TCreateProductForm>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: getDefaults()
  });

  useEffect(() => {
    if (isOpen)
      form.reset(getDefaults());
  }, [isOpen]);

  const { mutate: create, isPending } = useMutation({
    mutationFn: (values: TCreateProductForm) => orpc.admin.products.create.call(values),
    onSuccess: (product) => {
      toast.success(m['pages.products.form.create_success']());
      close();
      void navigate({ to: '/admin/products/$productId', params: { productId: product.id } });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    }
  });

  const onOpenChange = (value: boolean) => {
    if (isPending || value)
      return;

    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{m['pages.products.form.create_title']()}</SheetTitle>
          <SheetDescription>{m['pages.products.form.section_general_description']()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <FormProvider {...form}>
            <form id={FORM_ID} onSubmit={form.handleSubmit((values) => create(values))} className="px-4 py-1">
              <fieldset disabled={isPending}>
                <ProductFields/>
              </fieldset>
            </form>
          </FormProvider>
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isPending}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton form={FORM_ID} className="grow sm:min-w-32 sm:grow-0" loading={isPending}>
              <IconFilePlus/>
              <span>{m['common.create']()}</span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
