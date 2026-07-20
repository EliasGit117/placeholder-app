import { useEffect } from 'react';
import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconHome, IconPackage, IconPackageOff } from '@tabler/icons-react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import type { IBreadcrumb } from '@/components/layout/admin/breadcrumbs.tsx';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import {
  ProductFormFields,
  detailsDefaultsFromProduct,
  productDetailsFormSchema,
  type TProductDetailsForm
} from './../-components/product-editor';
import { OptionsManager } from './../-components/options-manager';
import { VariantsManager } from './../-components/variants-manager';


export const Route = createFileRoute('/admin/products/$productId/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  params: {
    parse: ({ productId }) => ({ productId: parseInt(productId, 10) }),
    stringify: ({ productId }) => ({ productId: String(productId) })
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { products: ['get'] });
    if (!canGet)
      throw redirect({ to: '/admin/products', replace: true });

    const canUpdate = await roleHasPermission(user?.role, { products: ['update'] });
    return { canUpdate };
  },
  loader: async ({ context: { queryClient }, params: { productId } }) => {
    if (!Number.isInteger(productId))
      throw notFound();

    let product;
    try {
      product = await queryClient.fetchQuery(
        orpc.admin.products.get.queryOptions({ input: { id: productId } })
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'NOT_FOUND')
        throw notFound();
      throw error;
    }

    if (!product)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: `«${product[`name${capitalizeFirst(locale)}`]}»`}];
    return { crumbs, product };
  }
});


function NotFound() {

  return (
    <main className="container mx-auto pb-4 px-4">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon"><IconPackageOff/></EmptyMedia>
          <EmptyTitle>{m['pages.products.not_found']()}</EmptyTitle>
          <EmptyDescription>{m['pages.products.not_found_description']()}</EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <IconHome/>
              <span>{m['common.home']()}</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">
              <IconPackage/>
              <span>{m['pages.products.title']()}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}


function RouteComponent() {
  const { productId } = Route.useParams();
  const { canUpdate } = Route.useRouteContext();
  const { product: initialProduct } = Route.useLoaderData();
  const queryClient = useQueryClient();

  const { data: product } = useQuery({
    ...orpc.admin.products.get.queryOptions({ input: { id: productId } }),
    initialData: initialProduct
  });

  const form = useForm<TProductDetailsForm>({
    resolver: zodResolver(productDetailsFormSchema),
    defaultValues: detailsDefaultsFromProduct(initialProduct)
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
        shortDescriptionRo: values.shortDescriptionRo,
        shortDescriptionRu: values.shortDescriptionRu,
        slug: values.slug,
        state: values.state,
        categoryId: values.categoryId
      }),
    onSuccess: (data) => {
      toast.success(m['pages.products.form.save_success']());
      void queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });
      form.reset(detailsDefaultsFromProduct(data));
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    }
  });

  if (!product)
    return null;

  return (
    <div className="@container space-y-4">
      <div className="grid grid-cols-1 @5xl:grid-cols-3 gap-4">
        <FormProvider {...form}>
          <form
            className="space-y-4 @5xl:col-span-2"
            onSubmit={form.handleSubmit((values) => update(values))}
          >
            <Card>
              <CardHeader>
                <CardTitle>{m['pages.products.form.section_general']()}</CardTitle>
                <CardDescription>{m['pages.products.form.section_general_description']()}</CardDescription>
                {canUpdate && (
                  <CardAction>
                    <LoadingButton variant='secondary' type="submit" size="sm" loading={isPending}>
                      <IconDeviceFloppy className="size-4"/>
                      <span>{m['common.save']()}</span>
                    </LoadingButton>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                <fieldset disabled={!canUpdate || isPending}>
                  <ProductFormFields disabled={!canUpdate || isPending}/>
                </fieldset>
              </CardContent>
            </Card>
          </form>
        </FormProvider>

        <OptionsManager
          productId={productId}
          options={product.options}
          canUpdate={canUpdate}
        />
      </div>

      <VariantsManager
        productId={productId}
        options={product.options}
        variants={product.variants}
        canUpdate={canUpdate}
      />
    </div>
  );
}
