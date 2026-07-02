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
  useRef,
  useState
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { type ICategoryPublicNode, type TCategoryPublicForest } from '@/features/categories/dtos/category-public.ts';
import { IconArrowUpRight, IconChevronRight } from '@tabler/icons-react';


interface IProps extends ComponentPropsWithoutRef<typeof NavigationMenu> {
}

export const HeaderNavigationMenu: FC<IProps> = ({ className, ...props }) => {
  const { user } = useAuth();
  const links = getLinksPerRole(user?.role);

  const { data: categories } = useQuery(orpc.categories.getTree.queryOptions({
    input: { depth: 2 }
  }));

  return (
    <NavigationMenu{...props} className={cn('[&>div:last-child]:mt-3', className)}>
      <NavigationMenuList className="gap-0.5">
        {!!categories?.length && (
          <NavigationMenuItem className="hidden md:flex">
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent className="p-0">
              <ShopFlyout categories={categories}/>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {links.map((link) => (
          <NavigationMenuItem key={link.to}>
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

interface IShopFlyoutProps {
  categories: TCategoryPublicForest;
}

const ShopFlyout: FC<IShopFlyoutProps> = ({ categories }) => {
  const [active, setActive] = useState<ICategoryPublicNode>();
  const lastPointerType = useRef('mouse');

  const handlePointerEnter = (category: ICategoryPublicNode, e: PointerEvent) => {
    if (e.pointerType != 'mouse')
      return;

    setActive(category);
  };

  const handleFocus = (category: ICategoryPublicNode, e: FocusEvent<HTMLElement>) => {
    // keyboard focus only — touch tap also focuses, but is handled in onClick
    if (!e.target.matches(':focus-visible'))
      return;

    setActive(category);
  };

  // touch has no hover: first tap opens the panel, second tap navigates
  const wantsOpenOnly = (category: ICategoryPublicNode) =>
    lastPointerType.current !== 'mouse' &&
    category.children.length > 0 &&
    active?.slug !== category.slug;

  // stop TanStack Router navigation on the first touch tap
  const handleClick = (category: ICategoryPublicNode, e: MouseEvent) => {
    if (!wantsOpenOnly(category))
      return;

    e.preventDefault();
    setActive(category);
  };

  // stop Radix from closing the whole menu on the first touch tap
  const handleSelect = (category: ICategoryPublicNode, e: Event) => {
    if (!wantsOpenOnly(category))
      return;

    e.preventDefault();
  };

  return (
    <div className="flex min-h-64">
      <ul className="flex w-60 flex-col gap-0.5 p-2">
        <li className="px-2 py-1.5 text-sm font-bold">Categories</li>

        {categories.map((category) => (
          <li key={category.slug}>
            <NavigationMenuLink asChild onSelect={(e) => handleSelect(category, e)}>
              <CategoryLink
                category={category}
                onPointerDown={(e) => lastPointerType.current = e.pointerType}
                onPointerEnter={(e) => handlePointerEnter(category, e)}
                onFocus={(e) => handleFocus(category, e)}
                onClick={(e) => handleClick(category, e)}
                className={cn(
                  'relative w-full justify-between',
                  active?.slug === category.slug &&
                  'bg-muted before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
                )}
              >
                <span className='brightness-110'>
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
        ))}
      </ul>

      {!!active?.children.length && (
        <ul className="flex w-60 flex-col gap-0.5 border-l bg-muted p-2">
          <li className="px-2 py-1.5 text-sm font-bold">{active.name}</li>

          <li>
            <NavigationMenuLink asChild>
              <CategoryLink category={active} className="w-full">
                Show all
              </CategoryLink>
            </NavigationMenuLink>
          </li>

          {active.children.map((child) => (
            <li key={child.slug}>
              <NavigationMenuLink asChild>
                <CategoryLink category={child} className="w-full">
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

interface ICategoryLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'to'> {
  category?: ICategoryPublicNode;
}

const CategoryLink: FC<ICategoryLinkProps> = ({ category: _category, ...props }) => {
  return <Link to="/" {...props}/>;
};
