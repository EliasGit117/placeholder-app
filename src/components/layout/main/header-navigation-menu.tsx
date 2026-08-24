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
import {
  type ComponentPropsWithoutRef,
  type FC,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useState
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import {
  type ICategoryNodeDto,
  type TCategoryForestDto
} from '@/features/categories/public/dtos/category-tree.ts';
import {
  IconArrowUpRight,
  IconChevronRight
} from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';


interface IProps extends ComponentPropsWithoutRef<typeof NavigationMenu> {
}

export const HeaderNavigationMenu: FC<IProps> = ({ className, ...props }) => {
  const { user } = useAuth();
  const links = getLinksPerRole(user?.role);

  const { data: categories, isPending } = useQuery(orpc.categories.getTree.queryOptions({ input: { depth: 2 } }));

  return (
    <NavigationMenu className={cn('[&>div:last-child]:mt-2', className)} {...props}>
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger className="uppercase font-normal">
            {m['components.header.categories']()}
          </NavigationMenuTrigger>

          <NavigationMenuContent className="p-0">
            {isPending ? (
              <ShopFlyoutSkeleton/>
            ) : (
              !!categories?.length && <ShopFlyout categories={categories}/>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>

        {links.map((link) => (
          <NavigationMenuItem key={link.to}>
            <NavigationMenuLink className={cn('uppercase font-normal!', navigationMenuTriggerStyle())} asChild>
              <Link to={link.to}>
                {link.name()}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};


const ShopFlyoutSkeleton: FC = () => (
  <div className="flex max-h-64">
    <ul className="flex w-60 flex-col gap-0.5 p-2">
      <li className="px-2 py-1.5 text-sm font-bold">
        {m['components.header.categories']()}
      </li>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="px-2 py-2">
          <Skeleton className="h-4 w-full" style={{ width: `${70 + ((i * 13) % 30)}%` }}/>
        </li>
      ))}
    </ul>
  </div>
);

interface IShopFlyoutProps {
  categories: TCategoryForestDto;
}

type TPointerType = 'mouse' | 'touch' | 'pen';

const ShopFlyout: FC<IShopFlyoutProps> = ({ categories }) => {
  const [active, setActive] = useState<ICategoryNodeDto>();
  const [pointerType, setPointerType] = useState<TPointerType>('mouse');

  const handlePointerEnter = (category: ICategoryNodeDto, e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse')
      return;

    setActive(category);
  };

  const handleFocus = (category: ICategoryNodeDto, e: FocusEvent<HTMLElement>) => {
    if (!e.target.matches(':focus-visible'))
      return;

    setActive(category);
  };

  const wantsOpenOnly = (category: ICategoryNodeDto) => pointerType === 'touch' && category.children.length > 0 && active?.slug !== category.slug;

  const handleClick = (category: ICategoryNodeDto, e: MouseEvent) => {
    if (!wantsOpenOnly(category))
      return;

    e.preventDefault();
    setActive(category);
  };

  const handleSelect = (category: ICategoryNodeDto, e: Event) => {
    if (!wantsOpenOnly(category))
      return;

    e.preventDefault();
  };

  return (
    <div className="flex max-h-64">
      <ScrollArea className='pr-0.5 mr-0.5' type='always'>
        <ul className="flex w-60 flex-col gap-0.5 p-2">
          {categories.map((category) => {
            const isActive =
              active?.slug === category.slug;

            return (
              <li key={category.slug}>
                <NavigationMenuLink onSelect={(e) => handleSelect(category, e)} asChild>
                  <CategoryLink
                    category={category}
                    aria-expanded={isActive}
                    onPointerDown={(e) => setPointerType(e.pointerType as | TPointerType)}
                    onPointerEnter={(e) => handlePointerEnter(category, e)}
                    onFocus={(e) => handleFocus(category, e)}
                    onClick={(e) => handleClick(category, e)}
                    className={cn(
                      'relative w-full justify-between',
                      isActive && 'bg-muted before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
                    )}
                  >
                    <span className="brightness-110">
                      {category.name}
                    </span>

                    {category.children.length > 0 ? (
                      <IconChevronRight className="size-4 text-muted-foreground/50"/>
                    ) : (
                      <IconArrowUpRight className="size-4 text-muted-foreground/50"/>
                    )}
                  </CategoryLink>
                </NavigationMenuLink>
              </li>
            );
          })}
        </ul>
      </ScrollArea>

      {!!active?.children.length && (
        <ul className="flex w-60 flex-col gap-0.5 border-l bg-muted p-2">
          <li className="px-2 py-1.5 text-sm font-bold">
            {active.name}
          </li>

          {pointerType === 'touch' && (
            <li>
              <NavigationMenuLink asChild>
                <CategoryLink category={active} className="w-full">
                  {m['components.header.show_all']()}
                </CategoryLink>
              </NavigationMenuLink>
            </li>
          )}

          {active.children.map((child) => (
            <li key={child.slug}>
              <NavigationMenuLink asChild>
                <CategoryLink className="w-full" category={child}>
                  {child.name}
                </CategoryLink>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface ICategoryLinkProps extends ComponentPropsWithoutRef<'a'> {
  category?: ICategoryNodeDto;
}

const CategoryLink: FC<ICategoryLinkProps> = ({ category, ...props }) => {
  return (
    <Link
      to="/products"
      search={{ categoryId: category?.id }}
      {...props}
    />
  );
};