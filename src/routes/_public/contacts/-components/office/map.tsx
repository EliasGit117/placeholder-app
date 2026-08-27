import type { FC } from 'react';
import { IconBrandGoogle, IconMinus, IconPlus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Map, MapMarker, MarkerContent, MarkerPopup, useMap } from '@/components/ui/map';
import type { IOffice } from './info';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

const controlButtonClassName =
  'flex size-6.5 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors hover:bg-accent dark:hover:bg-accent/40';

const MapActionsBar: FC<{ mapsUrl: string }> = ({ mapsUrl }) => {
  const { map } = useMap();

  return (
    <div className="absolute right-2.5 bottom-10 z-10 flex flex-col items-center gap-1.5">
      <Button type="button" size="icon-sm" variant="outline" className='size-6.5 bg-background!' asChild>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open in Google Maps"
          className={controlButtonClassName}
        >
          <IconBrandGoogle className="size-3.5"/>
        </a>
      </Button>

      <ButtonGroup orientation="vertical">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Zoom in"
          onClick={() => map?.zoomTo(map.getZoom() + 1, { duration: 300 })}
          className={cn('size-6.5 bg-background!')}
        >
          <IconPlus className="size-3.5"/>
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Zoom out"
          onClick={() => map?.zoomTo(map.getZoom() - 1, { duration: 300 })}
          className={cn('size-6.5 bg-background!')}
        >
          <IconMinus className="size-3.5"/>
        </Button>
      </ButtonGroup>
    </div>
  );
};

export const OfficeMap: FC<{ office: IOffice; className?: string }> = ({ office, className }) => {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border', className)}>
      <Map
        theme="dark"
        center={[office.longitude, office.latitude]}
        zoom={14}
        className="h-80 w-full @3xl:h-full"
        attributionControl={{ compact: true }}
      >
        <MapActionsBar mapsUrl={office.mapsUrl}/>

        <MapMarker longitude={office.longitude} latitude={office.latitude}>
          <MarkerContent>
            <div className="bg-primary-foreground border border-primary rounded-full p-0.5">
              <div className="bg-primary ring-background size-3 rounded-full ring-2"/>
            </div>
          </MarkerContent>
          <MarkerPopup closeButton>
            <div className="text-sm font-medium">{office.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{office.address}</div>
          </MarkerPopup>
        </MapMarker>
      </Map>
    </div>
  );
};
