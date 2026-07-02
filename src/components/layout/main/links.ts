import { IconDashboard, IconPhoto, type TablerIcon } from '@tabler/icons-react';
import type { LinkOptions } from '@tanstack/react-router';
import type { TUser } from '@/lib/auth/better-auth.ts';
import { m } from '@/paraglide/messages';


export const headerLinks: { name: () => string, to: LinkOptions['to']; icon: TablerIcon; roles?: TUser['role'][] }[] = [
  { name: () => m['components.header.gallery'](), to: '/gallery', icon: IconPhoto },
  { name: () => m['components.header.admin'](), to: '/admin', icon: IconDashboard, roles: ['admin'] }
];

export function getLinksPerRole(role: TUser['role'] | undefined | null) {
  return headerLinks.filter(link => !link.roles || link.roles?.includes(role));
}