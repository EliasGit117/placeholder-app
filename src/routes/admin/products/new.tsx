import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import {
  OptionSchemaEditor,
  ProductFields,
  VariantsFieldArray,
  emptyVariant,
  optionsToRecord,
  productFormSchema,
  pruneOptionValues,
  type TProductForm,
} from './-components/product-editor';


export const Route = createFileRoute('/admin/products/new')({
  component: RouteComponent,
  staticData: { crumbs: { title: () => m['pages.products.form.create_title']() } },
  beforeLoad: async ({ context: { user } }) => {
    const canCreate = await roleHasPermission(user?.role, { products: ['create'] });
    if (!canCreate)
      throw redirect({ to: '/admin/products', replace: true });
  },
});


function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm<TProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nameRo: '',
      nameRu: '',
      descriptionRo: '',
      descriptionRu: '',
      slug: '',
      state: ProductState.active,
      options: [],
      variants: [emptyVariant()],
    },
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (values: TProductForm) =>
      orpc.admin.products.create.call({
        nameRo: values.nameRo,
        nameRu: values.nameRu,
        descriptionRo: values.descriptionRo,
        descriptionRu: values.descriptionRu,
        slug: values.slug,
        state: values.state,
        options: optionsToRecord(values.options),
        variants: values.variants.map(v => ({
          nameRo: v.nameRo,
          nameRu: v.nameRu,
          price: v.price,
          stock: v.stock,
          optionValues: pruneOptionValues(v.optionValues, values.options),
        })),
      }),
    onSuccess: (product) => {
      toast.success(m['pages.products.form.create_success']());
      void navigate({ to: '/admin/products/$productId', params: { productId: product.id } });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((values) => create(values))} className="space-y-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon-sm" asChild>
            <Link to="/admin/products">
              <IconArrowLeft className="size-4"/>
            </Link>
          </Button>
          <h1 className="flex-1 text-lg font-semibold">{m['pages.products.form.create_title']()}</h1>
          <LoadingButton type="submit" size="sm" loading={isPending}>
            <IconDeviceFloppy className="size-4"/>
            <span>{m['common.create']()}</span>
          </LoadingButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{m['pages.products.form.section_general']()}</CardTitle>
            <CardDescription>{m['pages.products.form.section_general_description']()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductFields/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{m['pages.products.form.section_options']()}</CardTitle>
            <CardDescription>{m['pages.products.form.section_options_description']()}</CardDescription>
          </CardHeader>
          <CardContent>
            <OptionSchemaEditor/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{m['pages.products.form.section_variants']()}</CardTitle>
            <CardDescription>{m['pages.products.form.section_variants_description']()}</CardDescription>
          </CardHeader>
          <CardContent>
            <VariantsFieldArray/>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
