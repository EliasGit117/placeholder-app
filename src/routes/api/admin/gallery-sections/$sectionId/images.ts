import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth/better-auth.ts';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { GallerySectionService } from '@/features/gallery-sections/services/gallery-section-service.ts';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

async function handle({ request, params }: { request: Request; params: Record<string, string> }): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const sectionId = parseInt(params.sectionId, 10);
  if (isNaN(sectionId))
    return Response.json({ error: 'Invalid section ID' }, { status: 400 });

  const section = await GallerySectionService.findById(sectionId);
  if (!section)
    return Response.json({ error: 'Gallery section not found' }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const purpose = formData.get('purpose') as string;
  const widthRaw = formData.get('width') as string;
  const heightRaw = formData.get('height') as string;

  if (!(file instanceof File))
    return Response.json({ error: 'Missing file' }, { status: 400 });

  if (!purpose || !(purpose in ImagePurpose))
    return Response.json({ error: 'Invalid purpose' }, { status: 400 });

  const width = parseInt(widthRaw, 10);
  const height = parseInt(heightRaw, 10);

  if (!width || !height || width <= 0 || height <= 0)
    return Response.json({ error: 'Invalid dimensions' }, { status: 400 });

  try {
    const uploaded = await s3Storage.upload(file, { acl: 'public-read' });

    const image = await ImageService.create({
      url: uploaded.url,
      key: uploaded.key,
      size: uploaded.size,
      mimeType: file.type,
      width,
      height,
      resourceType: ImageResourceType.GALLERY_SECTION,
      resourceId: sectionId,
      purpose: purpose as ImagePurpose,
    });

    return Response.json(image, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute('/api/admin/gallery-sections/$sectionId/images')({
  server: {
    handlers: {
      POST: handle,
    },
  },
});
