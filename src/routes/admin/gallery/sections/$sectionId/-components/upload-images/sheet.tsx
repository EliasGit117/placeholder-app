import { type FC, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconChevronDown, IconX } from '@tabler/icons-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { orpc } from 'src/lib/orpc';
import { xhrUpload } from 'src/lib/utils';
import { FileUploadStatus, useFileUpload, type IUploadHelpers } from 'src/hooks/use-file-upload';
import { DropZone, FileItem, RejectedFile } from 'src/components/file-upload';
import { ImagePurpose } from 'prisma/generated/prisma/enums.ts';
import type { TOrpcOutputs } from 'src/features/shared/orpc/router';
import { m } from '@/paraglide/messages';
import { useUploadImagesSheet } from './provider';


type TUploadImageResponse = TOrpcOutputs['admin']['gallery']['sections']['uploadImage'];

const accept = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
const maxSize = 10 * 1024 * 1024;

const purposeLabels: Record<ImagePurpose, () => string> = {
  [ImagePurpose.PRIMARY]: () => m['pages.gallery_sections.detail.purpose.primary'](),
  [ImagePurpose.THUMBNAIL]: () => m['pages.gallery_sections.detail.purpose.thumbnail'](),
  [ImagePurpose.BACKGROUND]: () => m['pages.gallery_sections.detail.purpose.background'](),
};


export const UploadImagesSheet: FC = () => {
  const { isOpen, options, close } = useUploadImagesSheet();
  const queryClient = useQueryClient();

  const [purpose, setPurpose] = useState<ImagePurpose>(
    options?.defaultPurpose ?? ImagePurpose.PRIMARY,
  );

  const sectionId = options?.sectionId;

  const uploadFile = async (file: File, { onProgress, signal }: IUploadHelpers) => {
    if (!sectionId)
      throw new Error('Missing section ID');

    const body = new FormData();
    body.append('file', file);
    body.append('purpose', purpose);

    await xhrUpload<TUploadImageResponse>(
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{m['pages.gallery_sections.detail.purpose.label']()}:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUploading}>
                    <span>{purposeLabels[purpose]()}</span>
                    <IconChevronDown className="ml-1 opacity-50" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={purpose}
                    onValueChange={(v) => setPurpose(v as ImagePurpose)}
                  >
                    {Object.values(ImagePurpose).map((p) => (
                      <DropdownMenuRadioItem key={p} value={p}>
                        {purposeLabels[p]()}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
