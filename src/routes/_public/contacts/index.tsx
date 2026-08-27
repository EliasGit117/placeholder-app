import { createFileRoute } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import { Eyebrow } from '@/routes/_public/-components/shared';
import { OfficeInfo, OfficeMap, type IOffice } from '@/routes/_public/contacts/-components/office';

export const Route = createFileRoute('/_public/contacts/')({
  staticData: { crumbs: { title: () => m['components.header.contacts']() } },
  component: RouteComponent,
});

const office: IOffice = {
  name: m['pages.contacts.office.name'](),
  email: 'hello@skinery.md',
  phone: m['pages.contacts.office.phone'](),
  address: m['pages.contacts.office.address'](),
  hours: m['pages.contacts.hours'](),
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=47.0257,28.8323',
  longitude: 28.8323,
  latitude: 47.0257,
};

function RouteComponent() {
  return (
    <section className="bg-background @container">
      <div className="container mx-auto px-4 pt-8 pb-20 md:pb-28">
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1fr] @3xl:items-stretch">
          <div className="flex flex-col gap-8">
            <div>
              <Eyebrow>{m['components.footer.contact']()}</Eyebrow>
              <h1 className="mt-2 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
                {m['pages.contacts.title']()}
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                {m['pages.contacts.description']()}
              </p>
            </div>

            <OfficeInfo office={office}/>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              {m['pages.contacts.map_label']()}
            </span>
            <OfficeMap office={office} className="flex-1"/>
          </div>
        </div>
      </div>
    </section>
  );
}
