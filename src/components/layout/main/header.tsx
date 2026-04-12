import type { ComponentProps } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button.tsx';
import { IconCheckbox, IconTrafficCone, IconUserCircle, IconUserPlus } from '@tabler/icons-react';
import { envConfig } from '@/lib/config';
import { cn } from '@/lib/utils';
import { LocaleDropdown } from '@/components/locale';
import { ThemeDropdown } from '@/components/theme';
import { ButtonGroup } from '@/components/ui/button-group.tsx';


interface IProps extends ComponentProps<'header'> {

}

export const Header = ({ children, className, ...props }: IProps) => {
  return (
    <header className={cn('container mx-auto p-4', className)} {...props}>
      <nav className="flex gap-4 items-center">
        <Button variant="default" size="lg" className="text-xl [&>svg]:size-6!" asChild>
          <Link to="/">
            <IconTrafficCone/>
            <span>
              {envConfig.appName}
            </span>
          </Link>
        </Button>

        <div className="flex items-center gap-1">
          <Button variant="link" size="sm" asChild>
            <Link to="/todos" activeProps={{ className: 'underline' }}>
              <IconCheckbox/>
              <span>Todos</span>
            </Link>
          </Button>

          <Button variant="link" size="sm" asChild>
            <Link to="/sign-up" activeProps={{ className: 'underline' }}>
              <IconUserPlus/>
              <span>Sign up</span>
            </Link>
          </Button>
        </div>

        <div className="flex-1"/>

        <ButtonGroup>
          <ThemeDropdown size="icon-sm" className="min-w-10"/>
          <LocaleDropdown size="icon-sm" className="min-w-10"/>
          <Button variant='outline' size="icon-sm" className="min-w-10">
            <IconUserCircle/>
          </Button>
        </ButtonGroup>
      </nav>
    </header>
  );
};
