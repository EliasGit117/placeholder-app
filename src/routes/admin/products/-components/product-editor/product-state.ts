import { IconArchive, IconCircleCheck, IconCircleX, IconEyeOff, type TablerIcon } from '@tabler/icons-react';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';

export interface IProductStateOption {
  value: ProductState;
  label: () => string;
  icon: TablerIcon;
}

export const productStateOptions: IProductStateOption[] = [
  { value: ProductState.ACTIVE, label: () => m['pages.products.form.state_active'](), icon: IconCircleCheck },
  { value: ProductState.NOT_AVAILABLE, label: () => m['pages.products.form.state_not_available'](), icon: IconCircleX },
  { value: ProductState.HIDDEN, label: () => m['pages.products.form.state_hidden'](), icon: IconEyeOff },
  { value: ProductState.ARCHIVED, label: () => m['pages.products.form.state_archived'](), icon: IconArchive },
];

export function getProductStateOption(state: ProductState): IProductStateOption {
  return productStateOptions.find(o => o.value === state) ?? productStateOptions[0];
}
