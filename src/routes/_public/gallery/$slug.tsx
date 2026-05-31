import { createFileRoute, notFound } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { thumbhashToDataUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconPhoto } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TGallerySectionImageDto } from '@/features/gallery-sections/dtos/gallery-section-image.ts';
import type { FC } from 'react';


export const Route = createFileRoute('/_public/gallery/$slug')({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const section = await queryClient.fetchQuery(orpc.gallery.sections.getBySlug.queryOptions({ input: { slug } })).catch(() => null);
    if (!section)
      throw notFound();

    await awaitIfServer(queryClient.prefetchQuery(orpc.gallery.sections.getImages.queryOptions({ input: { slug } })));
  }
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data: section } = useQuery(orpc.gallery.sections.getBySlug.queryOptions({ input: { slug } }));
  const { data: images = [], isPending } = useQuery(orpc.gallery.sections.getImages.queryOptions({ input: { slug } }));

  return (
    <main className="container mx-auto pb-4 px-4 space-y-4">
      {section && (
        <div className="space-y-1">
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      )}

      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg"/>
          ))}
        </div>
      ) : images.length === 0 ? (
        <Empty className="mt-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconPhoto/>
            </EmptyMedia>
            <EmptyTitle className="text-muted-foreground">
              {m['pages.gallery_sections.detail.no_images']()}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <PublicImageCard key={img.id} image={img}/>
          ))}
        </div>
      )}
    </main>
  );
}

const PublicImageCard: FC<{ image: TGallerySectionImageDto }> = ({ image }) => {
  const small = image.variants.thumb256?.url ?? image.url;
  const large = image.variants.thumb512?.url ?? small;
  const placeholder = thumbhashToDataUrl(image.thumbhash);

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-lg bg-muted bg-cover bg-center"
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
    >
      <picture className="block h-full w-full">
        <source media="(min-width: 640px)" srcSet={large}/>
        <img
          src={small}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
    </div>
  );
};
