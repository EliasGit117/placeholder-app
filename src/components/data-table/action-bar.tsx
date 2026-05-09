import { type ComponentProps, type FC, type ReactNode, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { useDataTableContext } from '@/components/data-table/context.tsx';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { useIsMobile } from '@/hooks/use-mobile.ts';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { type TablerIcon, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


const ActionBarContext = createContext<{ disabled?: boolean }>({});

interface IProps {
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export const DataTableActionBar: FC<IProps> = ({ children, disabled, className }) => {
  // noinspection BadExpressionStatementJS
  'use no memo';
  const isMobile = useIsMobile();
  const { table } = useDataTableContext();
  const selectedRows = table.getSelectedRowModel().rows;

  if (selectedRows.length <= 0)
    return null;

  return (
    <ActionBarContext.Provider value={{ disabled }}>
      <div
        className={cn(
          'fixed bottom-4 left-1/2 transform -translate-x-1/2',
          'bg-background border p-1.5 z-50 rounded-xl shadow-sm ',
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1">
          <ButtonGroup>
            {!isMobile && (
              <Button variant="outline" size="sm" disabled={disabled} className="font-normal lowercase">
                {selectedRows.length} {m['common.selected']()}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={disabled}
              onClick={() => table.resetRowSelection()}
            >
              <IconX/>
            </Button>
          </ButtonGroup>

          {children && (
            <>
              <Separator
                orientation="vertical"
                className="my-auto mx-0.5 data-[orientation=vertical]:h-6"
              />
              {children}
            </>
          )}
        </div>
      </div>
    </ActionBarContext.Provider>
  );
};

interface IActionBarButtonProps
  extends Omit<ComponentProps<typeof Button>, 'children'> {
  icon?: TablerIcon;
  text: string;
}

export const ActionBarButton = (props: IActionBarButtonProps) => {
  const { text, disabled: propsDisabled, className, ...btnProps } = props;
  const { disabled: contextDisabled } = useContext(ActionBarContext);
  const isMobile = useIsMobile();

  const button = (
    <Button
      size="sm"
      variant="secondary"
      className={cn('w-7 md:w-fit font-normal', className)}
      disabled={contextDisabled}
      {...btnProps}
    >
      {props.icon && <props.icon/>}
      {!isMobile && <span>{text}</span>}
    </Button>
  );

  if (!isMobile)
    return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};