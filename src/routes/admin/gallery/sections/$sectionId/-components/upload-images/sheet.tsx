import { type FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconX } from '@tabler/icons-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/components/ui/sheet';
import { ScrollArea } from 'src/components/ui/scroll-area';
import { Button } from 'src/components/ui/button';
import { orpc } from 'src/lib/orpc';
import { xhrUpload } from 'src/lib/utils';
import { FileUploadStatus, useFileUpload, type IUploadHelpers } from 'src/hooks/use-file-upload';
import { DropZone, FileItem, RejectedFile } from 'src/components/file-upload';
import type { TImageDto } from 'src/features/images/dtos/image-dto';
import { getImageUploadConstraints } from 'src/features/images/consts/image-resource-map';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';
import { useUploadImagesSheet } from './provider';


// Single source of truth: the picker accepts exactly what the server policy
// allows for gallery-section images (see imagePolicy in image-resource-map).
const { accept, maxSize } = getImageUploadConstraints(
  ImageResourceType.GALLERY_SECTION,
  ImagePurpose.GALLERY_SECTION_IMAGE
);


export const UploadImagesSheet: FC = () => {
  const { isOpen, options, close } = useUploadImagesSheet();
  const queryClient = useQueryClient();

  const sectionId = options?.sectionId;

  const uploadFile = async (file: File, { onProgress, signal }: IUploadHelpers) => {
    if (!sectionId)
      throw new Error('Missing section ID');

    const body = new FormData();
    body.append('file', file);

    await xhrUpload<TImageDto>(
      `/api/admin/gallery/sections/${sectionId}/images`,
      body,
      { signal, onProgress },
    );

    void queryClient.invalidateQueries({
      queryKey: orpc.admin.gallery.sections.getImages.key(),
    });
  };

  const [{ files, rejected, isUploading }, { addFiles, removeFile, retry, clearRejected, clear }] =
    useFileUpload({
      accept,
      maxSize,
      maxFiles: 20,
      multiple: true,
      upload: uploadFile,
    });

  const onOpenChange = (v: boolean) => {
    if (v) return;
    if (isUploading) return;
    clear();
    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{m['pages.gallery_sections.detail.upload_sheet.title']()}</SheetTitle>
          <SheetDescription>{m['pages.gallery_sections.detail.upload_sheet.description']()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <div className="space-y-4 px-4 py-1">
            <DropZone multiple accept={accept} maxSize={maxSize} onFilesSelected={addFiles} />

            {rejected.length > 0 && (
              <div className="space-y-2">
                {rejected.map((r, i) => (
                  <RejectedFile key={i} rejection={r} onDismiss={clearRejected} />
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((item) => (
                  <FileItem
                    key={item.id}
                    file={item.file}
                    preview={item.preview}
                    status={item.status}
                    progress={item.progress}
                    error={item.error}
                    onRemove={
                      item.status === FileUploadStatus.Uploading ? undefined : () => removeFile(item.id)
                    }
                    onRetry={item.status === FileUploadStatus.Error ? () => retry(item.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isUploading}>
                <IconX />
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
