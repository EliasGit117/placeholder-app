import { z } from 'zod';
import type { PageNumberCounters, PageNumberPagination } from 'prisma-extension-pagination/dist/types';


export type TPaginationResultBase<T> = {
  items: T[];
  page: number;
};

export type TPaginationResultWithCount<T> = TPaginationResultBase<T> & {
  pageCount: number;
  totalCount: number;
};

export const paginationResultDtoSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  items: z.array(itemSchema),
  page: z.number().int().positive()
});

export const paginationResultWithCountDtoSchema = <T extends z.ZodTypeAny>(itemSchema: T) => paginationResultDtoSchema(itemSchema).extend({
  pageCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative()
});

export class PaginationResultDtoFactory {

  static get<T>(items: T[], meta: PageNumberPagination): TPaginationResultBase<T> {

    return {
      items: items,
      page: meta.currentPage
    };
  }

  static getWithCount<T>(items: T[], meta: PageNumberPagination & PageNumberCounters): TPaginationResultWithCount<T> {

    return {
      items: items,
      page: meta.currentPage,
      pageCount: meta.pageCount,
      totalCount: meta.totalCount
    };
  }
}