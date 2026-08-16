import { type FC, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { DropZone } from '@/components/file-upload/drop-zone.tsx';
import { orpc, client } from '@/lib/orpc';
import { cn, xhrUpload } from '@/lib/utils';
import { getImageUploadConstraints } from '@/features/images/common/consts/image-resource-map.ts';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';
import type { TCategoryImageDto } from '@/features/categories/common/dtos/category-image.ts';

const { accept, maxSize } = getImageUploadConstraints(ImageResourceType.CATEGORY, ImagePurpose.CATEGORY_IMAGE);

interface IProps {
  categoryId: number;
  onPendingChange?: (isPending: boolean) => void;
}

export const CategoryImage: FC<IProps> = ({ categoryId, onPendingChange }) => {
  const queryClient = useQueryClient();

  const imageQueryKey = orpc.admin.categories.getImage.queryKey({ input: { id: categoryId } });

  const { data: image, isLoading } = useQuery(
    orpc.admin.categories.getImage.queryOptions({ input: { id: categoryId } })
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: imageQueryKey });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return xhrUpload<TCategoryImageDto>(`/api/admin/categories/${categoryId}/image`, body);
    },
    onSuccess: () => {
      void invalidate();
      toast.success(m['pages.categories.index.sheet.image_updated']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  const remove = useMutation({
    mutationFn: () => client.admin.categories.deleteImage({ id: categoryId }),
    onSuccess: () => {
      void invalidate();
      toast.success(m['pages.categories.index.sheet.image_removed']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  const isBusy = upload.isPending || remove.isPending;

  useEffect(() => {
    onPendingChange?.(isBusy);
    return () => onPendingChange?.(false);
  }, [isBusy]);

  if (isLoading)
    return (
      <Field className="col-span-full">
        <FieldLabel className="flex justify-center">
          {m['pages.categories.index.sheet.image']()}
        </FieldLabel>
        <Skeleton className="aspect-square max-w-64 rounded-lg mx-auto"/>
      </Field>
    );

  return (
    <Field className="col-span-full">
      <FieldLabel className='flex justify-center'>
        {m['pages.categories.index.sheet.image']()}
      </FieldLabel>

      {image ? (
        <div className="group relative aspect-square max-w-64 mx-auto overflow-hidden rounded-lg border">
          <img
            src={image.variants.thumb256?.url ?? image.url}
            alt=""
            className="h-full w-full object-cover"
          />
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            disabled={isBusy}
            onClick={() => remove.mutate()}
          >
            <IconTrash/>
          </Button>
        </div>
      ) : (
        <DropZone
          accept={accept}
          maxFileSize={maxSize}
          multiple={false}
          className={cn('aspect-square max-w-64 mx-auto p-2', isBusy && 'pointer-events-none opacity-60')}
          onFilesSelected={(files) => {
            const file = files[0];
            if (file)
              upload.mutate(file);
          }}
        />
      )}
    </Field>
  );
};
