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
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ScrollArea>
              <ul className="grid lg:grid-cols-2 gap-1 w-64 md:w-86 lg:w-lg max-h-72 mr-3">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton className="h-8.5" key={i}/>
                  ))
                ) : (categories?.map((ctg) => (
                  <li key={ctg.slug}>
                    <NavigationMenuLink asChild>
                      <Link to="/">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="leading-none font-medium">{ctg.name}</div>
                          {ctg.description && (
                            <div className="line-clamp-3 text-muted-foreground text-xs">{ctg.description}</div>
                          )}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )))}
              </ul>
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {links.map((link) => (
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to={link.to}>
                {link.name}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
