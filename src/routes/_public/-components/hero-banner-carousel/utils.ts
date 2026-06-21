import { BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';


const yOverlayMap: Record<BannerYAlign, string> = {
  [BannerYAlign.TOP]: 'top-16',
  [BannerYAlign.CENTER]: 'top-1/2 -translate-y-1/2',
  [BannerYAlign.BOTTOM]: 'bottom-0 pb-20',
};

const xOverlayMap: Record<BannerXAlign, string> = {
  [BannerXAlign.LEFT]: 'items-start text-left',
  [BannerXAlign.CENTER]: 'items-center text-center',
  [BannerXAlign.RIGHT]: 'items-end text-right',
};

const scrimMap: Record<BannerYAlign, Record<'darkImage' | 'lightImage', string>> = {
  [BannerYAlign.TOP]: {
    darkImage:  'bg-gradient-to-b from-black/35 via-black/12 to-transparent',
    lightImage: 'bg-gradient-to-b from-white/20 via-white/6 to-transparent',
  },
  [BannerYAlign.CENTER]: {
    darkImage:  'bg-black/18',
    lightImage: 'bg-white/12',
  },
  [BannerYAlign.BOTTOM]: {
    darkImage:  'bg-gradient-to-t from-black/40 via-black/14 to-transparent',
    lightImage: 'bg-gradient-to-t from-white/22 via-white/6 to-transparent',
  },
};

export function overlayYClass(y: BannerYAlign): string {
  return yOverlayMap[y];
}

export function overlayXClass(x: BannerXAlign): string {
  return xOverlayMap[x];
}

export function scrimClass(y: BannerYAlign, darkImage: boolean): string {
  return scrimMap[y][darkImage ? 'darkImage' : 'lightImage'];
}
