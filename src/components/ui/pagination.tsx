import * as React from "react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from '@/components/ui/button';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDots
} from '@tabler/icons-react'
import type { ComponentProps } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        "mx-auto flex w-full justify-center",
        className
      )}
      {...props}
    />
  )
}

function PaginationContent({
                             className,
                             ...props
                           }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("gap-1 flex items-center", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type TPaginationLinkProps =
  { isActive?: boolean }
  & Pick<ComponentProps<typeof Button>, 'size' | 'className' | 'variant'>
  & LinkProps;

const PaginationLink = (props: TPaginationLinkProps) => {
  const { className, isActive, size = 'icon', variant, disabled, ...restOfProps } = props;

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: !!variant ? variant : isActive ? 'outline' : 'ghost', size: size }),
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...restOfProps}
    />
  );
};

PaginationLink.displayName = 'PaginationLink';


interface IPaginationPreviousProps extends ComponentProps<typeof PaginationLink> {
  textHidden?: boolean;
}

const PaginationPrevious = (props: IPaginationPreviousProps) => {
  const { className, textHidden, ...restOfProps } = props;

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn(!textHidden && 'gap-1 pl-2.5', className)}
      {...restOfProps}
    >
      <IconChevronLeft className="h-4 w-4"/>
      {!textHidden && <span>Previous</span>}
    </PaginationLink>
  );
};

PaginationPrevious.displayName = 'PaginationPrevious';


interface IPaginationNextProps extends ComponentProps<typeof PaginationLink> {
  textHidden?: boolean;
}

const PaginationNext = (props: IPaginationNextProps) => {
  const { className, textHidden, ...restOfProps } = props;

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn(!textHidden && 'gap-1 pl-2.5', className)}
      {...restOfProps}
    >
      {!textHidden && <span>Next</span>}
      <IconChevronRight className="h-4 w-4"/>
    </PaginationLink>
  );
};

PaginationNext.displayName = 'PaginationNext';


function PaginationEllipsis({
                              className,
                              ...props
                            }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <IconDots/>
      <span className="sr-only">More pages</span>
    </span>
  )
}


interface IPaginationFirstProps extends ComponentProps<typeof PaginationLink> {
  textHidden?: boolean;
}

const PaginationFirst = (props: IPaginationFirstProps) => {
  const { className, textHidden, ...restOfProps } = props;

  return (
    <PaginationLink
      aria-label="Go to first page"
      size="default"
      className={cn(!textHidden && 'gap-1 pl-2.5', className)}
      {...restOfProps}
    >
      {!textHidden && <span>First</span>}
      <IconChevronsLeft className="h-4 w-4"/>
    </PaginationLink>
  );
};


interface IPaginationLastProps extends ComponentProps<typeof PaginationLink> {
  textHidden?: boolean;
}

const PaginationLast = (props: IPaginationLastProps) => {
  const { className, textHidden, ...restOfProps } = props;

  return (
    <PaginationLink
      aria-label="Go to last page"
      size="default"
      className={cn(!textHidden && 'gap-1 pl-2.5', className)}
      {...restOfProps}
    >
      {!textHidden && <span>Last</span>}
      <IconChevronsRight className="h-4 w-4"/>
    </PaginationLink>
  );
};

PaginationLast.displayName = 'PaginationLast';

PaginationFirst.displayName = 'PaginationFirst';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationPrevious,
}
