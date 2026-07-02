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
import { type ComponentPropsWithoutRef, type FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { type ICategoryPublicNode, type TCategoryPublicForest } from '@/features/categories/dtos/category-public.ts';
import { Button } from '@/components/ui/button';
import { IconChevronLeft } from '@tabler/icons-react';


interface IProps extends ComponentPropsWithoutRef<typeof NavigationMenu> {
}

export const HeaderNavigationMenu: FC<IProps> = ({ ...props }) => {
  const { user } = useAuth();
  const links = getLinksPerRole(user?.role);

  const { data: categories } = useQuery(orpc.categories.getTree.queryOptions({
    input: { depth: 3 }
  }));

  return (
    <NavigationMenu
      {...props}
      className={cn(
        '[&>div:last-child]:left-1/2 [&>div:last-child]:-translate-x-1/2 [&>div:last-child]:mt-2.75',
        // '**:data-[slot=navigation-menu-viewport]:w-full **:data-[slot=navigation-menu-viewport]:md:w-full',
        // '**:data-[slot=navigation-menu-content]:w-full',
        // '**:data-[slot=navigation-menu-viewport]:duration-300',
        // fade from top instead of zoom
        // '**:data-[slot=navigation-menu-viewport]:data-open:zoom-in-100 **:data-[slot=navigation-menu-viewport]:data-open:slide-in-from-top-2 **:data-[slot=navigation-menu-viewport]:data-open:fade-in-0',
        // '**:data-[slot=navigation-menu-viewport]:data-closed:zoom-out-100 **:data-[slot=navigation-menu-viewport]:data-closed:slide-out-to-top-2 **:data-[slot=navigation-menu-viewport]:data-closed:fade-out-0',
        props.className
      )}
    >
      <NavigationMenuList className="gap-0.5">
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <CategoriesList categories={categories}/>
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

interface ICategoriesListProps {
  categories?: TCategoryPublicForest;
}

const CategoriesList: FC<ICategoriesListProps> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<ICategoryPublicNode>();

  return (
    <div className='flex flex-col gap-2 p-2 h-64'>
      {!selectedCategory ? (
        <ul className="w-screen max-w-2xl grid grid-cols-2">
          {categories?.map(ctg => (
            <li key={ctg.slug}>
              <NavigationMenuLink asChild>
                <button className="text-left" onClick={() => setSelectedCategory(ctg)}>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="leading-none font-medium">{ctg.name}</div>
                    <div className="line-clamp-3 text-xs text-muted-foreground">{ctg.description}</div>
                  </div>
                </button>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="flex gap-1 items-center col-span-full h-fit">
            <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(undefined)}>
              <IconChevronLeft/>
            </Button>
            <p className="font-semibold">{selectedCategory.name}</p>
          </div>
          <ul className="w-screen max-w-2xl grid grid-cols-3">
            <li>
              <NavigationMenuLink asChild>
                <button className="text-left w-full">
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="leading-none font-medium">See all</div>
                  </div>
                </button>
              </NavigationMenuLink>
            </li>
            {selectedCategory.children.map(ctg => (
              <li key={ctg.slug}>
                <NavigationMenuLink asChild>
                  <button className="text-left w-full">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="leading-none font-medium">{ctg.name}</div>
                    </div>
                  </button>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};