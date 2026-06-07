import { createFileRoute, Link } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { thumbhashToDataUrl } from '@/lib/utils';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import {
  IconHome,
  IconMoodSad,
  IconPhotoOff,
  IconRefresh
} from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TGallerySectionImageDto } from '@/features/gallery-sections/dtos/gallery-section-image.ts';
import type { FC } from 'react';

import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { LoadingButton } from '@/components/ui/loading-button.tsx';

export const Route = createFileRoute('/_public/gallery/$slug')({
  component: RouteComponent,
  notFoundComponent: GallerySectionNotFound,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery(
        orpc.gallery.sections.getWithImages.queryOptions({
          input: { slug }
        })
      )
    );
  }
});

function RouteComponent() {
  const { slug } = Route.useParams();

  const { data, isPending, isFetching, refetch } = useQuery(orpc.gallery.sections.getWithImages.queryOptions({
    input: { slug },
    placeholderData: keepPreviousData
  }));

  const section = data?.section;
  const images = data?.images ?? [];

  return (
    <main className="container mx-auto p-4 pt-0 flex flex-col gap-4 flex-1">
      {section && (
        <div className="space-y-1">
          {section.description && (
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
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
        <Empty className='-mt-20 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto'>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconPhotoOff/>
            </EmptyMedia>

            <EmptyTitle>
              {m['pages.gallery_sections.detail.no_images']()}
            </EmptyTitle>
            <EmptyDescription>
              {m['pages.gallery_sections.detail.no_images_description']()}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild>
              <Link to="/">
                <IconHome/>
                <span>{m['common.home']()}</span>
              </Link>
            </Button>

            <LoadingButton variant="outline" onClick={() => refetch()} loading={isFetching}>
              <IconRefresh/>
              <span>{m['common.refresh']()}</span>
            </LoadingButton>
          </EmptyContent>
        </Empty>
      ) : (
        <PhotoProvider
          maskOpacity={0.9}
          speed={() => 300}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <PublicImageCard
                key={image.id}
                image={image}
              />
            ))}
          </div>
        </PhotoProvider>
      )}
    </main>
  );
}

function GallerySectionNotFound() {
  return (
    <main className="container mx-auto px-4 pb-4">
      <Empty className="mt-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconMoodSad/>
          </EmptyMedia>

          <EmptyTitle>
            {m['pages.gallery.not_found']()}
          </EmptyTitle>

          <EmptyDescription>
            {m['pages.gallery.not_found_description']()}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
            >
              <Link to="/">
                <IconHome/>
                {m['common.home']()}
              </Link>
            </Button>

            <Button asChild>
              <Link to="/gallery">
                <IconPhotoOff/>
                {m['pages.gallery.title']()}
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </main>
  );
}

const PublicImageCard: FC<{
  image: TGallerySectionImageDto;
}> = ({ image }) => {
  const small = image.variants.thumb256?.url ?? image.url;
  const large = image.variants.thumb512?.url ?? small;
  const placeholder = thumbhashToDataUrl(image.thumbhash);

  return (
    <PhotoView
      src={image.url}
      width={image.width}
      height={image.height}
    >
      <div
        className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted bg-cover bg-center"
        style={
          placeholder
            ? {
              backgroundImage: `url(${placeholder})`
            }
            : undefined
        }
      >
        <picture className="block h-full w-full">
          <source
            media="(min-width: 640px)"
            srcSet={large}
          />

          <img
            src={small}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </picture>
      </div>
    </PhotoView>
  );
};