import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Link, type LinkOptions, useMatches } from '@tanstack/react-router';
import { type ComponentProps, type FC, Fragment } from 'react';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { IconHome } from '@tabler/icons-react';


export interface IBreadcrumb {
  title: string | (() => string);
  disabled?: boolean;
  link?: LinkOptions;
}

interface IProps extends ComponentProps<'nav'> {}

const responsiveClassName = 'hidden sm:flex';

export const Breadcrumbs: FC<IProps> = ({ className, ...props }) => {
  const matches = useMatches();
  const hideBreadcrumbs = matches.some((match) => match.staticData?.hideCrumbs === true);
  if (hideBreadcrumbs)
    return null;

  const items: { label: string; link?: LinkOptions; pathname: string }[] = matches
    .flatMap(({ pathname, loaderData, staticData }) => {
      const loaderCrumbs = parseBreadcrumbList(extractCrumbs(loaderData));
      const staticCrumbs = parseBreadcrumbList(staticData?.crumbs);
      const crumbs = loaderCrumbs ?? staticCrumbs ?? [];

      return crumbs
        .filter((crumb) => !crumb.disabled)
        .map((crumb) => ({
          label: typeof crumb.title === 'function' ? crumb.title() : crumb.title,
          link: crumb.link,
          pathname
        }));
    });

  const collapsed = items.slice(0, -1);

  return (
    <nav
      className={cn('min-w-0 flex-1 overflow-x-auto', className)}
      {...props}
    >
      <div className="flex w-max py-1">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbLink className="flex items-center gap-1" asChild>
              <Link to="/">
                {items.length > 0 && <IconHome className="size-4 sm:hidden"/>}
                <span className={cn(items.length > 0 && 'sr-only sm:not-sr-only')}>
                  {m['common.home']()}
                </span>
              </Link>
            </BreadcrumbLink>

            {items.length > 0 && <BreadcrumbSeparator/>}

            {collapsed.length > 0 && (
              <Fragment>
                <BreadcrumbItem className="flex sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost">
                        <BreadcrumbEllipsis/>
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuGroup>
                        {collapsed.map((item, index) => (
                          <DropdownMenuItem key={`${index}-${item.label}`} asChild>
                            {item.link ? (
                              <Link {...item.link}>{item.label}</Link>
                            ) : (
                              <Link to={item.pathname}>{item.label}</Link>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="flex sm:hidden"/>
              </Fragment>
            )}

            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              if (!isLast) {
                return (
                  <Fragment key={`${index}-${item.label}`}>
                    <BreadcrumbLink className={responsiveClassName} asChild>
                      {item.link ? (
                        <Link {...item.link}>{item.label}</Link>
                      ) : (
                        <Link to={item.pathname}>{item.label}</Link>
                      )}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator className={responsiveClassName}/>
                  </Fragment>
                );
              }

              return (
                <BreadcrumbItem key={`${index}-${item.label}`}>
                  <BreadcrumbPage>
                    {item.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </nav>
  );
};

function extractCrumbs(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'crumbs' in data)
    return data.crumbs;

  return undefined;
}

function isBreadcrumb(value: unknown): value is IBreadcrumb {
  if (typeof value !== 'object' || value === null)
    return false;

  const data = value as Record<string, unknown>;

  return (
    (typeof data.title === 'string' || typeof data.title === 'function') &&
    (data.disabled === undefined || typeof data.disabled === 'boolean') &&
    (data.link === undefined || typeof data.link === 'object')
  );
}

function parseBreadcrumbList(value: unknown): IBreadcrumb[] | null {
  if (isBreadcrumb(value))
    return [value];

  if (Array.isArray(value) && value.every(isBreadcrumb))
    return value;

  return null;
}
