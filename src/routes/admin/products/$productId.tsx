import { useEffect } from 'react';
import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import {
  OptionSchemaEditor,
  ProductFields,
  detailsDefaultsFromProduct,
  optionsToRecord,
  productDetailsFormSchema,
  type TProductDetailsForm,
} from './-components/product-editor';
import { VariantsManager } from './-components/variants-manager';


export const Route = createFileRoute('/admin/products/$productId')({
  component: RouteComponent,
  params: {
    parse: ({ productId }) => ({ productId: parseInt(productId, 10) }),
    stringify: ({ productId }) => ({ productId: String(productId) }),
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { products: ['get'] });
    if (!canGet)
      throw redirect({ to: '/admin/products', replace: true });

    const canUpdate = await roleHasPermission(user?.role, { products: ['update'] });
    return { canUpdate };
  },
  loader: async ({ context: { queryClient }, params: { productId } }) => {
    const product = await queryClient.fetchQuery(
      orpc.admin.products.get.queryOptions({ input: { id: productId } })
    );
    if (!product)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: product[`name${capitalizeFirst(locale)}`] }];
    return { crumbs };
  },
});


function RouteComponent() {
  const { productId } = Route.useParams();
  const { canUpdate } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const { data: product } = useQuery(orpc.admin.products.get.queryOptions({ input: { id: productId } }));

  const form = useForm<TProductDetailsForm>({
    resolver: zodResolver(productDetailsFormSchema),
    defaultValues: {
      nameRo: '', nameRu: '', descriptionRo: '', descriptionRu: '', slug: '',
      state: ProductState.active, options: [],
    },
  });

  useEffect(() => {
    if (product)
      form.reset(detailsDefaultsFromProduct(product));
  }, [product]);

  const { mutate: update, isPending } = useMutation({
    mutationFn: (values: TProductDetailsForm) =>
      orpc.admin.products.update.call({
        id: productId,
        nameRo: values.nameRo,
        nameRu: values.nameRu,
        descriptionRo: values.descriptionRo,
        descriptionRu: values.descriptionRu,
        slug: values.slug,
        state: values.state,
        options: optionsToRecord(values.options),
      }),
    onSuccess: () => {
      toast.success(m['pages.products.form.save_success']());
      void queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    },
  });

  if (!product)
    return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon-sm" asChild>
          <Link to="/admin/products">
            <IconArrowLeft className="size-4"/>
          </Link>
        </Button>
        <h1 className="flex-1 text-lg font-semibold truncate">{product.nameRo}</h1>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((values) => update(values))} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{m['pages.products.form.section_general']()}</CardTitle>
              <CardDescription>{m['pages.products.form.section_general_description']()}</CardDescription>
            </CardHeader>
            <CardContent>
              <fieldset disabled={!canUpdate}>
                <ProductFields/>
              </fieldset>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{m['pages.products.form.section_options']()}</CardTitle>
              <CardDescription>{m['pages.products.form.section_options_edit_description']()}</CardDescription>
            </CardHeader>
            <CardContent>
              <fieldset disabled={!canUpdate}>
                <OptionSchemaEditor/>
              </fieldset>
            </CardContent>
          </Card>

          {canUpdate && (
            <div className="flex justify-end">
              <LoadingButton type="submit" size="sm" loading={isPending}>
                <IconDeviceFloppy className="size-4"/>
                <span>{m['common.save']()}</span>
              </LoadingButton>
            </div>
          )}
        </form>
      </FormProvider>

      <Card>
        <CardHeader>
          <CardTitle>{m['pages.products.form.section_variants']()}</CardTitle>
          <CardDescription>{m['pages.products.variants.manage_description']()}</CardDescription>
        </CardHeader>
        <CardContent>
          <VariantsManager
            productId={productId}
            options={product.options}
            variants={product.variants}
            canUpdate={canUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
