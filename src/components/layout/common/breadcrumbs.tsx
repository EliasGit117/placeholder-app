import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Link, type LinkOptions, useMatches } from '@tanstack/react-router';
import { type ComponentProps, type FC, Fragment } from 'react';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';


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

  items.unshift({ label: m['common.home'](), pathname: '/' });

  return (
    <nav className={cn(className)} {...props}>
      <div className="flex w-max py-1">
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              if (!isLast) {
                return (
                  <Fragment key={`${index}-${item.label}`}>
                    <BreadcrumbLink className={responsiveClassName} asChild>
                      {item.link ? (
                        <Link {...item.link}>
                          {item.label}
                        </Link>
                      ) : (
                        <Link to={item.pathname}>
                          {item.label}
                        </Link>
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
