'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import type { ComponentPropsWithoutRef, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { Link } from '@tanstack/react-router';
import { ScrollArea } from '@/components/ui/scroll-area';


interface IProps extends ComponentPropsWithoutRef<typeof NavigationMenu> {
}

export const HeaderNavigationMenu: FC<IProps> = ({ ...props }) => {
  const { user } = useAuth();
  const links = getLinksPerRole(user?.role);

  const { data: categories, isPending } = useQuery(orpc.categories.getTree.queryOptions({
    input: { depth: 2 }
  }));

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-0.5">
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger className="uppercase">Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ScrollArea>
              <ul className="grid lg:grid-cols-2 gap-3 w-64 md:w-86 lg:w-lg max-h-96 p-4">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton className="h-8.5" key={i}/>
                  ))
                ) : (categories?.map((ctg) => (
                  <li key={ctg.slug}>
                    <NavigationMenuLink asChild>
                      <Link to="/" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="leading-none font-medium">{ctg.name}</div>
                          {ctg.description && (
                            <div className="line-clamp-2 text-muted-foreground text-xs">{ctg.description}</div>
                          )}
                        </div>
                        {ctg.children.length > 0 && (
                          <div className="mt-2 grid grid-cols-1 gap-1 border-t pt-2">
                            {ctg.children.map((child) => (
                              <div key={child.slug} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                {child.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )))}
              </ul>
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {links.map((link) => (
          <NavigationMenuItem key={link.to}>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'uppercase underline-offset-8')} asChild>
              <Link to={link.to} activeProps={{ className: 'underline text-primary' }}>
                {link.name}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
