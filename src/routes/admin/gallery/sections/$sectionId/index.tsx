import { useRef, useState } from 'react';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconChevronDown, IconLoader2, IconUpload } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';


export const Route = createFileRoute('/admin/gallery/sections/$sectionId/')({
  component: RouteComponent,
  params: {
    parse: ({ sectionId }) => ({ sectionId: parseInt(sectionId, 10) }),
    stringify: ({ sectionId }) => ({ sectionId: String(sectionId) })
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { gallerySections: ['get'] });
    if (!canGet)
      throw redirect({ to: '/admin/gallery/sections', replace: true });

    const canUpdate = await roleHasPermission(user?.role, { gallerySections: ['update'] });
    const canDelete = await roleHasPermission(user?.role, { gallerySections: ['delete'] });
    return { canUpdate, canDelete };
  },
  loader: async ({ context: { queryClient }, params: { sectionId } }) => {
    const [section] = await Promise.all([
      queryClient.fetchQuery(
        orpc.admin.gallery.sections.getById.queryOptions({ input: { id: sectionId } })
      ),
      queryClient.prefetchQuery(
        orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })
      ),
    ]);

    if (!section)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: section[`name${capitalizeFirst(locale)}`] }];
    return { crumbs };
  }
});


function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image dimensions'));
    };
    img.src = url;
  });
}

const purposeLabels: Record<ImagePurpose, string> = {
  [ImagePurpose.PRIMARY]: 'Primary',
  [ImagePurpose.THUMBNAIL]: 'Thumbnail',
  [ImagePurpose.BACKGROUND]: 'Background',
};


function RouteComponent() {
  const { sectionId } = Route.useParams();
  const { canUpdate } = Route.useRouteContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [purpose, setPurpose] = useState<ImagePurpose>(ImagePurpose.PRIMARY);
  const queryClient = useQueryClient();

  const { data: images = [], isPending: isPendingImages } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })
  );

  const { mutate: uploadImage, isPending: isUploading } = useMutation({
    ...orpc.admin.gallery.sections.uploadImage.mutationOptions(),
    onSuccess: () => {
      toast.success('Image uploaded');
      void queryClient.invalidateQueries({
        queryKey: orpc.admin.gallery.sections.getImages.key(),
      });
    },
    onError: (err) => toast.error(err.message),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const { width, height } = await getImageDimensions(file);
      uploadImage({ sectionId, file, purpose, width, height });
    } catch {
      toast.error('Could not read image dimensions');
    }
  }

  return (
    <div className="space-y-6">
      {canUpdate && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isUploading}>
                <span>{purposeLabels[purpose]}</span>
                <IconChevronDown className="ml-1 opacity-50" size={16}/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={purpose}
                onValueChange={(v) => setPurpose(v as ImagePurpose)}
              >
                {Object.values(ImagePurpose).map((p) => (
                  <DropdownMenuRadioItem key={p} value={p}>
                    {purposeLabels[p]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading
              ? <IconLoader2 className="animate-spin" size={16}/>
              : <IconUpload size={16}/>}
            <span>{isUploading ? 'Uploading…' : 'Upload image'}</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {isPendingImages ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg"/>
          ))}
        </div>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img src={img.url} alt="" className="h-full w-full object-cover"/>
              <Badge variant="secondary" className="absolute bottom-1.5 left-1.5 text-xs">
                {purposeLabels[img.purpose]}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
