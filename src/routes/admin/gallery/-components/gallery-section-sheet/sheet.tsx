import { type FC, useEffect } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconDeviceFloppy, IconFilePlus, IconX } from '@tabler/icons-react';
import { GallerySectionSheetMode, useGallerySectionSheet } from './provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { GallerySectionForm } from './form';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';
import {
  createGallerySectionDtoSchema,
  type TCreateGallerySectionDto
} from '@/features/gallery-sections/dtos/create-gallery-section.ts';
import {
  type TUpdateGallerySectionDto,
  updateGallerySectionDtoSchema
} from '@/features/gallery-sections/dtos/update-gallery-section.ts';


interface IProps {
  onSuccess?: () => void;
}

export const GallerySectionSheet: FC<IProps> = ({ onSuccess }) => {
  const { isOpen, options, close } = useGallerySectionSheet();

  const mode = options?.mode;
  const sectionId = options?.mode === GallerySectionSheetMode.Update ? options.sectionId : undefined;

  const form = useForm<TCreateGallerySectionDto | TUpdateGallerySectionDto>({
    resolver: zodResolver(mode === GallerySectionSheetMode.Create ? createGallerySectionDtoSchema : updateGallerySectionDtoSchema),
    defaultValues: getFormValues()
  });

  const { data: sectionData, isLoading: isLoadingSection } = useQuery({
    ...orpc.admin.gallery.sections.getById.queryOptions({ input: { id: sectionId! } }),
    enabled: mode === GallerySectionSheetMode.Update && !!sectionId,
    staleTime: 0,
    gcTime: 0
  });

  useEffect(() => {
    if (!sectionData) return;
    form.reset({
      nameRo: sectionData.nameRo,
      nameRu: sectionData.nameRu,
      descriptionRo: sectionData.descriptionRo ?? '',
      descriptionRu: sectionData.descriptionRu ?? '',
      state: sectionData.state
    });
  }, [sectionData]);

  const onMutationSuccess = () => {
    onSuccess?.();
    close();
  };

  const onMutationError = (error: unknown) => {
    const message = error instanceof Error ? error.message : m['common.error']();
    toast.error(m['common.error'](), { description: message });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (values: TCreateGallerySectionDto) =>
      orpc.admin.gallery.sections.create.call(values),
    onSuccess: onMutationSuccess,
    onError: onMutationError
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (values: TUpdateGallerySectionDto) => {
      if (!sectionId)
        throw new Error('Missing section ID');

      return orpc.admin.gallery.sections.update.call({ params: { id: sectionId }, body: values });
    },
    onSuccess: onMutationSuccess,
    onError: onMutationError
  });

  const onOpenChange = (v: boolean) => {
    if (isCreating || isUpdating || v) return;
    close();
  };

  const onSubmit = (values: TCreateGallerySectionDto | TUpdateGallerySectionDto) => {
    if (mode === GallerySectionSheetMode.Update) {
      const parsed = updateGallerySectionDtoSchema.safeParse(values);
      if (!parsed.success)
        return;

      update(parsed.data);
      return;
    }

    const parsed = createGallerySectionDtoSchema.safeParse(values);
    if (parsed.success)
      create(parsed.data);
  };

  useEffect(() => {
    if (!isOpen) return;
    form.reset(getFormValues());
  }, [isOpen, mode]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {mode === GallerySectionSheetMode.Update
              ? m['pages.gallery_sections.index.sheet.edit_title']()
              : m['pages.gallery_sections.index.sheet.create_title']()}
          </SheetTitle>
          <SheetDescription>
            {mode === GallerySectionSheetMode.Update
              ? m['pages.gallery_sections.index.sheet.edit_description']()
              : m['pages.gallery_sections.index.sheet.create_description']()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <GallerySectionForm
            id="gallery-section-form"
            form={form}
            className="px-4 py-1"
            loading={isLoadingSection}
            disabled={isCreating || isUpdating}
            onSubmit={onSubmit}
          />
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isCreating || isUpdating}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton
              form="gallery-section-form"
              className="grow sm:min-w-32 sm:grow-0"
              loading={isCreating || isUpdating}
            >
              {mode === GallerySectionSheetMode.Create ? <IconFilePlus/> : <IconDeviceFloppy/>}
              <span>
                {mode === GallerySectionSheetMode.Create ? m['common.create']() : m['common.save']()}
              </span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

function getFormValues(): TCreateGallerySectionDto | TUpdateGallerySectionDto {
  return {
    nameRo: '',
    nameRu: '',
    descriptionRo: '',
    descriptionRu: '',
    state: GallerySectionState.active
  };
}
