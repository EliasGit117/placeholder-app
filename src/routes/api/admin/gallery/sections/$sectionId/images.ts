import { createFileRoute } from '@tanstack/react-router';
import { ORPCError } from '@orpc/server';
import { auth } from '@/lib/auth/better-auth.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { GallerySectionService } from '@/features/gallery-sections/services/gallery-section-service.ts';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

async function handle({ request, params }: { request: Request; params: Record<string, string> }): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Match the get/delete/reorder routes: uploading requires the create
  // permission, not just an authenticated session.
  const { success } = await auth.api.userHasPermission({
    body: { userId: session.user.id, permissions: { gallerySections: ['create'] } },
  });
  if (!success)
    return Response.json({ error: 'Forbidden' }, { status: 403 });

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
  if (!(file instanceof File))
    return Response.json({ error: 'Missing file' }, { status: 400 });

  try {
    const image = await ImageService.upload({
      file,
      resourceType: ImageResourceType.GALLERY_SECTION,
      purpose: ImagePurpose.GALLERY_SECTION_IMAGE,
      resourceId: String(sectionId),
    });

    return Response.json(image, { status: 201 });
  } catch (error) {
    // Validation failures (too large, wrong type, …) are ORPCErrors carrying
    // their own HTTP status — surface it instead of a blanket 500.
    if (error instanceof ORPCError)
      return Response.json({ error: error.message }, { status: error.status });

    const message = error instanceof Error ? error.message : 'Upload failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute('/api/admin/gallery/sections/$sectionId/images')({
  server: {
    handlers: {
      POST: handle,
    },
  },
});
