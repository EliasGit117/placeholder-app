import { createFileRoute } from '@tanstack/react-router';
import { IconTools } from '@tabler/icons-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconTools/>
        </EmptyMedia>
        <EmptyTitle>{m['pages.dashboard.not_developed_title']()}</EmptyTitle>
        <EmptyDescription>{m['pages.dashboard.not_developed_description']()}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
