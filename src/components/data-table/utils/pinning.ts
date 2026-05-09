import type { Column, Row } from '@tanstack/react-table';
import type { CSSProperties } from 'react';

interface IPinningStylesParams<TData> {
  row?: Row<TData>;
  column: Column<TData>;
  withBorder?: boolean;
}

export function getCommonPinningStyles<TData>(params: IPinningStylesParams<TData>): CSSProperties {
  const { column, withBorder, row } = params;
  const isPinned = column.getIsPinned();
  const isSelected = row?.getIsSelected();
  const isLeftPinned = isPinned === 'left';
  const isRightPinned = isPinned === 'right';

  const isLastLeftPinnedColumn = isLeftPinned && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn = isRightPinned && column.getIsFirstColumn('right');

  const borderShadow = withBorder && (isLastLeftPinnedColumn || isFirstRightPinnedColumn)
    ? (isLastLeftPinnedColumn ? 'inset -1px 0 0 0 var(--border)' : 'inset 1px 0 0 0 var(--border)')
    : undefined;

  const pinnedPosition =
    isLeftPinned ? { left: `${column.getStart('left')}px` } :
      isRightPinned ? { right: `${column.getAfter('right')}px` } : {};

  return {
    position: isPinned ? 'sticky' : 'relative',
    opacity: 1,
    zIndex: isPinned ? 1 : 0,
    background: isSelected ? 'var(--muted-generated-50)' : 'var(--background)',
    width: column.getSize(),
    boxShadow: borderShadow,
    ...pinnedPosition
  };
}