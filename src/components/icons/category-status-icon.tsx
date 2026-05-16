import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';
import { IconCircleCheck, IconEyeOff, IconQuestionMark } from '@tabler/icons-react';

interface ICategoryStatusIconProps {
  status: CategoryState | string | undefined | null;
  className?: string;
}

export const CategoryStateIcon: FC<ICategoryStatusIconProps> = (props) => {
  const className = cn(props.className);
  const Icon = getProductStatusIcon(props.status);

  return <Icon className={className}/>;
};

export function getProductStatusIcon(status: CategoryState | string | undefined | null) {
  switch (status) {
    case CategoryState.active:
      return IconCircleCheck;

    case CategoryState.hidden:
      return IconEyeOff;

    default:
      return IconQuestionMark;
  }
}
