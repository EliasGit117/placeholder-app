import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { IconUser, IconUserCheck } from '@tabler/icons-react';
import type { TRole } from '~/src/lib/auth/permissions';

type TValue = TRole | string | undefined | null;

interface IUserRoleIconProps {
  role: TValue;
  className?: string;
}

export const UserRoleIcon: FC<IUserRoleIconProps> = (props) => {
  const className = cn(props.className);
  const Icon = getProductStatusIcon(props.role);

  return <Icon className={className}/>;
};

export function getProductStatusIcon(role: TValue) {
  switch (role) {
    case 'user':
      return IconUser;

    case 'admin':
      return IconUserCheck;

    default:
      return IconUser;
  }
}
