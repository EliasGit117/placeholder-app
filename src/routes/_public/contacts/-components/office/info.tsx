import type { FC } from 'react';
import { IconClock, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface IOffice {
  name: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  mapsUrl: string;
  longitude: number;
  latitude: number;
}

export const OfficeInfo: FC<{ office: IOffice; className?: string }> = ({ office, className }) => {
  return (
    <div className={cn('flex flex-col gap-4 text-sm', className)}>
      <h2 className="font-heading text-xl font-medium">{office.name}</h2>

      <a
        href={`mailto:${office.email}`}
        className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconMail className="size-4 shrink-0 text-primary"/>
        {office.email}
      </a>

      <a
        href={`tel:${office.phone.replace(/\s+/g, '')}`}
        className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconPhone className="size-4 shrink-0 text-primary"/>
        {office.phone}
      </a>

      <a
        href={office.mapsUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconMapPin className="size-4 shrink-0 text-primary"/>
        {office.address}
      </a>

      <div className="flex items-center gap-2.5 text-muted-foreground">
        <IconClock className="size-4 shrink-0 text-primary"/>
        {office.hours}
      </div>
    </div>
  );
};
