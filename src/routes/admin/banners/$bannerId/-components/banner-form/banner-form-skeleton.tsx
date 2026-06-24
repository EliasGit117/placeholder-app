import type { FC } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { bannerDevices } from '@/features/banners/consts/banner-devices.ts';


export const BannerFormSkeleton: FC = () => (
  <Card>
    <CardContent className="@container space-y-6">
      <div className="flex flex-wrap gap-6">
        {bannerDevices.map((device) => (
          <div key={device} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20"/>
            <Skeleton className="h-56 max-h-56 w-full rounded-md"/>
          </div>
        ))}
      </div>

      <Separator/>

      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex w-full flex-col gap-2">
            <Skeleton className="h-4 w-24"/>
            <Skeleton className="h-7 w-full"/>
          </div>
        ))}
      </div>
    </CardContent>

    <CardFooter className="justify-end">
      <Skeleton className="h-7 w-24"/>
    </CardFooter>
  </Card>
);
