import type { FC } from 'react';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IconPhotoOff } from '@tabler/icons-react';
import type { TBriefProductPublicDto } from '@/features/products/public/dtos/search-public-products';
import { m } from '@/paraglide/messages';

interface IProps {
  product: TBriefProductPublicDto;
}

export const ProductCard: FC<IProps> = ({ product }) => {
  const { name, category } = product;
  const placeholder = thumbhashToDataUrl(product.thumbhash);

  return (
    <article itemScope itemType="https://schema.org/Product">
      <Card className="overflow-hidden py-0 gap-0">
        <div
          className={cn(
            'ph-stripes relative grid aspect-[1/1.05] place-items-center border-b bg-muted bg-cover bg-center',
            'font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground'
          )}
          style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              itemProp="image"
            />
          ) : (
            <IconPhotoOff className="size-10 text-muted-foreground opacity-25" />
          )}
        </div>

        <CardHeader className="p-5 pb-4">
          {category && (
            <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-primary">
              {category}
            </div>
          )}

          <h3
            className="font-heading text-lg font-medium leading-tight"
            itemProp="name"
          >
            {name}
          </h3>
        </CardHeader>

        <CardContent className="px-5 pb-4">
          <Separator />
        </CardContent>

        <CardFooter className="flex items-center justify-between p-5 pt-0">
          <div
            className="font-heading text-lg font-semibold"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content="EUR" />
            <span itemProp="price">{product.price}</span>{' '}
            <small className="text-[13px] font-normal text-muted-foreground">
              {m['components.shop.currency']()}
            </small>
          </div>

          <Button variant="outline-primary">
            {m['components.shop.add_to_cart']()}
          </Button>
        </CardFooter>
      </Card>
    </article>
  );
};