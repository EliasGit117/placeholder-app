import { IconCircleCheck, IconCircleX, IconEyeOff, type TablerIcon } from '@tabler/icons-react';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';

export interface IProductStateOption {
  value: ProductState;
  label: () => string;
  icon: TablerIcon;
}

export const productStateOptions: IProductStateOption[] = [
  { value: ProductState.active, label: () => m['pages.products.form.state_active'](), icon: IconCircleCheck },
  { value: ProductState.not_available, label: () => m['pages.products.form.state_not_available'](), icon: IconCircleX },
  { value: ProductState.hidden, label: () => m['pages.products.form.state_hidden'](), icon: IconEyeOff },
];

export function getProductStateOption(state: ProductState): IProductStateOption {
  return productStateOptions.find(o => o.value === state) ?? productStateOptions[0];
}
