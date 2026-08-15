import type { ComponentProps, FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { cn, pickFirstLetters, thumbhashToDataUrl } from '@/lib/utils';

interface IProps extends ComponentProps<typeof Avatar> {
  user?: { name?: string | null; image?: string | null; imageThumbhash?: string | null } | null;
  imageClassName?: string;
  fallbackClassName?: string;
}

export const UserAvatar: FC<IProps> = ({
  user,
  className,
  imageClassName,
  fallbackClassName,
  style,
  ...props
}) => {
  const placeholder = thumbhashToDataUrl(user?.imageThumbhash ?? null);

  return (
    <Avatar
      className={cn('rounded-none', placeholder && 'bg-transparent', className)}
      style={placeholder ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover', ...style } : style}
      {...props}
    >
      {user?.image && <AvatarImage src={user.image} alt={user.name ?? ''} className={imageClassName}/>}
      <AvatarFallback className={cn(placeholder && 'bg-transparent', fallbackClassName)}>
        {pickFirstLetters(user?.name ?? '?', 2)}
      </AvatarFallback>
    </Avatar>
  );
};
