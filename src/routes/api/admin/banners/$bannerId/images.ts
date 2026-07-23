import { createFileRoute } from '@tanstack/react-router';
import { ORPCError } from '@orpc/server';
import { auth } from '@/lib/auth/better-auth.ts';
import { prisma } from '@/lib/db';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { BannerService } from '@/features/banners/common/services/banner-service.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannerDeviceFromString, bannerImagePurposeByLocaleDevice, bannerLocaleFromString } from '@/features/banners/common/consts/banner-devices.ts';

async function handle({ request, params }: { request: Request; params: Record<string, string> }): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Uploading/replacing a banner image is an update of the banner.
  const { success } = await auth.api.userHasPermission({
    body: { userId: session.user.id, permissions: { banners: ['update'] } },
  });
  if (!success)
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  const bannerId = parseInt(params.bannerId, 10);
  if (isNaN(bannerId))
    return Response.json({ error: 'Invalid banner ID' }, { status: 400 });

  // Which locale + device slot this upload targets (?locale=ru&device=mobile);
  // default to the base locale's desktop.
  const url = new URL(request.url);
  const device = bannerDeviceFromString(url.searchParams.get('device'));
  const locale = bannerLocaleFromString(url.searchParams.get('locale'));
  const purpose = bannerImagePurposeByLocaleDevice[locale][device];

  const banner = await BannerService.findById(bannerId);
  if (!banner)
    return Response.json({ error: 'Banner not found' }, { status: 404 });

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
    // The banner image is single-cardinality per device, so the new upload would
    // be rejected while the old image still exists. Replace by deleting the
    // previous image for this device first, then uploading the new one.
    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.BANNER, resourceId: String(bannerId), purpose },
    });
    if (existing)
      await ImageService.delete(existing.id).catch(() => undefined);

    const image = await ImageService.upload({
      file,
      resourceType: ImageResourceType.BANNER,
      purpose,
      resourceId: String(bannerId),
      fileName: `banner-${bannerId}-${locale}-${device}`,
    });

    return Response.json(image, { status: 201 });
  } catch (error) {
    if (error instanceof ORPCError)
      return Response.json({ error: error.message }, { status: error.status });

    const message = error instanceof Error ? error.message : 'Upload failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute('/api/admin/banners/$bannerId/images')({
  server: {
    handlers: {
      POST: handle,
    },
  },
});
