import { type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { m } from '@/paraglide/messages';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/card.tsx';

export const SIMILAR_PRODUCTS_LIMIT = 4;

interface IProps {
  categoryId: number;
  excludeSlugs: string[];
}

export const SimilarProducts: FC<IProps> = ({ categoryId, excludeSlugs }) => {
  const { data, isPending } = useQuery(
    orpc.products.search.queryOptions({
      input: { categoryId, limit: SIMILAR_PRODUCTS_LIMIT + excludeSlugs.length },
    })
  );

  const products = (data?.items ?? [])
    .filter((product) => !excludeSlugs.includes(product.slug))
    .slice(0, SIMILAR_PRODUCTS_LIMIT);

  if (!isPending && products.length === 0)
    return null;

  return (
    <div>
      <Separator className="mb-6"/>

      <h2 className="mb-4 font-heading text-lg font-semibold">
        {m['components.shop.similar_products']()}
      </h2>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: SIMILAR_PRODUCTS_LIMIT }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-2xl">
              <Skeleton className="aspect-square w-full rounded-2xl"/>
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3"/>
                <Skeleton className="h-4 w-1/3"/>
              </div>
            </li>
          ))
        ) : (
          products.map((product) => (
            <li key={product.id} className="contents">
              <ProductCard product={product}/>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
