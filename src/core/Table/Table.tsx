// Copyright (c) Bentley Systems, Incorporated. All rights reserved.
import React from 'react';
import cx from 'classnames';
import {
  CellProps,
  ColumnInstance,
  HeaderGroup,
  HeaderProps,
  Hooks,
  Row,
  TableOptions,
  TableState,
  useFlexLayout,
  useMountedLayoutEffect,
  useRowSelect,
  useTable,
} from 'react-table';
import { Checkbox } from '..';
import { ProgressRadial } from '../ProgressIndicators';
import { useTheme } from '../utils/hooks/useTheme';
import '@bentley/itwinui/css/flextables.css';
import { CommonProps } from '../utils/props';

/**
 * Table props.
 * columns and data must be memoized.
 */
export type TableProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = TableOptions<T> & {
  /**
   * Flag whether data is loading.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Content shown when there is no data.
   */
  emptyTableContent: React.ReactNode;
  /**
   * Flag whether table rows can be selectable.
   */
  isSelectable?: boolean;
  /**
   * Handler for rows selection.
   */
  onSelect?: (
    selectedData: T[] | undefined,
    tableState?: TableState<T>,
  ) => void;
} & CommonProps;

/**
 * Table based on react-table
 * @example
 * const columns = React.useMemo(() => [
 *  {
 *    Header: 'Header name',
 *    columns: [
 *      {
 *        id: 'name',
 *        Header: 'Name',
 *        accessor: 'name',
 *        width: 90,
 *      },
 *      {
 *        id: 'description',
 *        Header: 'description',
 *        accessor: 'description',
 *        maxWidth: 200,
 *      },
 *      {
 *        id: 'view',
 *        Header: 'view',
 *        Cell: () => {
 *          return <span onClick={onViewClick}>View</span>
 *        },
 *      },
 *    ],
 *  },
 * ], [onViewClick])
 * const data = [
 *  { name: 'Name1', description: 'Description1' },
 *  { name: 'Name2', description: 'Description2' },
 *  { name: 'Name3', description: 'Description3' },
 * ]
 * <Table
 *   columns={columns}
 *   data={data}
 *   emptyTableContent={'No data.'}
 *   isLoading={false}
 * />
 */
export const Table = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  props: TableProps<T>,
): JSX.Element => {
  const {
    columns,
    isLoading = false,
    emptyTableContent,
    className,
    style,
    isSelectable,
    onSelect,
  } = props;

  useTheme();

  const defaultColumn = React.useMemo(
    () => ({
      maxWidth: 0,
      minWidth: 0,
      width: 0,
    }),
    [],
  );

  const useSelectionHook = (hooks: Hooks<T>) => {
    if (!isSelectable) {
      return;
    }

    hooks.allColumns.push((columns: ColumnInstance<T>[]) => [
      // Let's make a column for selection
      {
        id: 'iui-table-checkbox-selector',
        disableResizing: true,
        disableGroupBy: true,
        minWidth: 48,
        width: 48,
        maxWidth: 48,
        columnClassName: 'iui-tables-slot',
        cellClassName: 'iui-tables-slot',
        Header: ({ getToggleAllRowsSelectedProps }: HeaderProps<T>) => (
          <Checkbox {...getToggleAllRowsSelectedProps()} />
        ),
        Cell: ({ row }: CellProps<T>) => (
          <Checkbox {...row.getToggleRowSelectedProps()} />
        ),
      },
      ...columns,
    ]);

    hooks.useInstanceBeforeDimensions.push(({ headerGroups }) => {
      // Fix the parent group of the selection button to not be resizable
      const selectionGroupHeader = headerGroups[0].headers[0];
      selectionGroupHeader.canResize = false;
    });
  };

  const instance = useTable<T>(
    {
      ...props,
      columns,
      defaultColumn,
    },
    useFlexLayout,
    useRowSelect,
    useSelectionHook,
  );

  const {
    getTableProps,
    rows,
    headerGroups,
    getTableBodyProps,
    prepareRow,
    data,
    selectedFlatRows,
    state,
  } = instance;

  useMountedLayoutEffect(() => {
    if (isSelectable && selectedFlatRows) {
      onSelect?.(
        selectedFlatRows.map((row) => row.original),
        state,
      );
    }
  }, [selectedFlatRows, onSelect]);

  const getStyle = (
    column: ColumnInstance<T>,
  ): React.CSSProperties | undefined => {
    const style = {} as React.CSSProperties;
    style.flex = `1 1 145px`;
    if (column.width) {
      const width =
        typeof column.width === 'string' ? column.width : `${column.width}px`;
      style.width = width;
      style.flex = `0 0 ${width}`;
    }
    if (column.maxWidth) {
      style.maxWidth = `${column.maxWidth}px`;
    }
    if (column.minWidth) {
      style.minWidth = `${column.minWidth}px`;
    }
    return style;
  };

  return (
    <div
      {...getTableProps({
        className: cx('iui-tables-table', className),
        style,
      })}
    >
      <div>
        {headerGroups.slice(1).map((headerGroup: HeaderGroup<T>) => {
          const headerGroupProps = headerGroup.getHeaderGroupProps({
            className: 'iui-tables-row',
          });
          return (
            <div {...headerGroupProps} key={headerGroupProps.key}>
              {headerGroup.headers.map((column) => {
                const columnProps = column.getHeaderProps({
                  className: cx(
                    'iui-tables-cell',
                    'iui-tables-head',
                    column.columnClassName,
                  ),
                  style: getStyle(column),
                });
                return (
                  <div {...columnProps} key={columnProps.key}>
                    {column.render('Header')}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div {...getTableBodyProps({ className: 'iui-tables-body' })}>
        {!isLoading &&
          data.length !== 0 &&
          rows.map((row: Row<T>) => {
            prepareRow(row);
            const rowProps = row.getRowProps({
              className: cx('iui-tables-row', {
                'iui-tables-row-active': row.isSelected,
              }),
            });
            return (
              <div {...rowProps} key={rowProps.key}>
                {row.cells.map((cell) => {
                  const cellProps = cell.getCellProps({
                    className: cx('iui-tables-cell', cell.column.cellClassName),
                    style: getStyle(cell.column),
                  });
                  return (
                    <div {...cellProps} key={cellProps.key}>
                      {cell.render('Cell')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        {isLoading && (
          <div className={'iui-tables-message-container'}>
            <ProgressRadial indeterminate={true} />
          </div>
        )}
        {!isLoading && data.length === 0 && (
          <div className={'iui-tables-message-container'}>
            {emptyTableContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;