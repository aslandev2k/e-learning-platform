import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table,
  type RowData as TanstackRowData,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  type ColumnMeta,
  deriveDefaultVisibility,
  useColumnVisibility,
} from '@/components/common/column-visibility-toggle';
import { TableFooter } from '@/components/common/table-footer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from '@/components/ui/table';
import { logger } from '@/lib/client-logger';
import { cn } from '@/lib/utils';

/**
 * Apply column metadata (header labels, enableHiding) from a COLUMN_MAP to column definitions.
 */
export function applyColumnMap<T>(
  columns: ColumnDef<T>[],
  columnMap: Record<string, ColumnMeta>,
): ColumnDef<T>[] {
  return columns.map((col) => {
    const key = (col as any).accessorKey as string | undefined;
    if (!key || !(key in columnMap)) return col;
    const { header, enableHiding } = columnMap[key];
    return { ...col, ...(col.header ? {} : { header }), enableHiding };
  });
}

/**
 * Derive header labels from a COLUMN_MAP for use with ColumnVisibilityToggle.
 */
export function deriveHeaderLabels(columnMap: Record<string, ColumnMeta>): Record<string, string> {
  return Object.fromEntries(Object.entries(columnMap).map(([key, meta]) => [key, meta.header]));
}

export type SortOrder = 'asc' | 'desc';

export interface SortState {
  sortBy?: string;
  sortOrder?: SortOrder;
}

interface SortableHeaderProps {
  label: string;
  field: string;
  sortState: SortState;
  onSort: (field: string) => void;
}

/**
 * Sortable column header button. Cycles through: unsorted → asc → desc → unsorted.
 */
export function SortableHeader({ label, field, sortState, onSort }: SortableHeaderProps) {
  const isActive = sortState.sortBy === field;
  const order = isActive ? sortState.sortOrder : undefined;

  return (
    <Button
      variant='ghost'
      size='sm'
      className='-ml-3 h-8 cursor-pointer data-[state=open]:bg-accent'
      onClick={() => onSort(field)}
    >
      <span>{label}</span>
      {order === 'asc' ? (
        <ArrowUpIcon className='ml-1 size-4' />
      ) : order === 'desc' ? (
        <ArrowDownIcon className='ml-1 size-4' />
      ) : (
        <ChevronsUpDownIcon className='ml-1 size-4 opacity-50' />
      )}
    </Button>
  );
}

interface UseSortStateOptions<S extends string = string> {
  search: { sortBy?: S; sortOrder?: SortOrder };
  updateSearch: (part: Partial<{ sortBy?: S; sortOrder?: SortOrder; pageIndex: number }>) => void;
}

/**
 * Standalone hook for server-side sort state management.
 * Use this BEFORE building columns so that handleSort can be passed into column definitions
 * (e.g. SortableHeader) without circular dependency on useDataTable.
 *
 * Pattern:
 *   const { sortState, handleSort } = useSortState({ search, updateSearch });
 *   const columns = buildColumns(sortState, handleSort);
 *   const { table, headerLabels } = useDataTable({ data, columns, ... });
 */
export function useSortState<S extends string = string>({
  search,
  updateSearch,
}: UseSortStateOptions<S>) {
  const sortState: SortState = { sortBy: search.sortBy, sortOrder: search.sortOrder };

  function handleSort(field: string) {
    if (search.sortBy !== field) {
      updateSearch({ sortBy: field as S, sortOrder: 'asc', pageIndex: 0 });
    } else if (search.sortOrder === 'asc') {
      updateSearch({ sortOrder: 'desc', pageIndex: 0 });
    } else {
      updateSearch({ sortBy: undefined, sortOrder: undefined, pageIndex: 0 });
    }
  }

  return { sortState, handleSort };
}

interface UseDataTableOptions<T extends TanstackRowData, S extends string = string> {
  data: T[];
  columns: ColumnDef<T>[];
  columnMap: Record<string, ColumnMeta>;
  tableName: string;
  search: { pageIndex: number; pageSize: number; sortBy?: S; sortOrder?: SortOrder };
  total: number;
  isFetching: boolean;
  updateSearch: (
    part: Partial<{ pageIndex: number; pageSize: number; sortBy?: S; sortOrder?: SortOrder }>,
  ) => void;
}

/**
 * Hook that encapsulates common table setup:
 * - Column visibility (localStorage-persisted)
 * - useReactTable with manual pagination and manual sorting
 * - Auto-navigate to last page when current page is empty
 */
export function useDataTable<T extends TanstackRowData, S extends string = string>({
  data,
  columns,
  columnMap,
  tableName,
  search,
  total,
  isFetching,
  updateSearch,
}: UseDataTableOptions<T, S>) {
  const defaultVisibility = deriveDefaultVisibility(columnMap);
  const headerLabels = deriveHeaderLabels(columnMap);
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(tableName, defaultVisibility);
  const pageCount = Math.ceil(total / search.pageSize);

  const sorting: SortingState = search.sortBy
    ? [{ id: search.sortBy, desc: search.sortOrder === 'desc' }]
    : [];

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      columnVisibility,
      pagination: search,
      sorting,
    },
    pageCount,
    manualPagination: true,
    manualSorting: true,
    getRowId: (row) => (row as any).id.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(search) : updater;
      updateSearch(next);
      return next;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    if (!isFetching && !data.length && total > 0) {
      logger.info(`logger ~ ${tableName} ~ auto-lastPage:`, total);
      table.lastPage();
    }
  }, [data, total, isFetching, table, tableName]);

  /** Cycle sort: unsorted → asc → desc → unsorted */
  function handleSort(field: string) {
    logger.info('logger ~ data-table.tsx ~ line 175:', field);
    if (search.sortBy !== field) {
      updateSearch({ sortBy: field as S, sortOrder: 'asc', pageIndex: 0 });
    } else if (search.sortOrder === 'asc') {
      updateSearch({ sortOrder: 'desc', pageIndex: 0 });
    } else {
      updateSearch({ sortBy: undefined, sortOrder: undefined, pageIndex: 0 });
    }
  }

  const sortState: SortState = { sortBy: search.sortBy, sortOrder: search.sortOrder };

  return { table, headerLabels, sortState, handleSort };
}

interface DataTableProps<T> {
  table: Table<T>;
  columns: ColumnDef<T>[];
  isFetching: boolean;
  isLoading: boolean;
  toolbar?: ReactNode;
  emptyMessage?: string;
  rowClassName?: (row: T) => string | undefined;
}

/**
 * Shared data table JSX shell: toolbar slot, table with header/body/loading, footer.
 */
export function DataTable<T>({
  table,
  columns,
  isFetching,
  isLoading,
  toolbar,
  emptyMessage = 'Không tìm thấy kết quả nào.',
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className='w-full flex flex-col justify-start gap-6'>
      {toolbar}
      <div className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'>
        <div className='overflow-hidden rounded-lg border'>
          <UITable className='[&_th:first-child]:pl-4 [&_td:first-child]:pl-4'>
            <TableHeader className='bg-muted sticky top-0 z-10'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody
              className={cn(
                '**:data-[slot=table-cell]:first:w-8 relative',
                isFetching && 'cursor-wait animate-pulse [&_button]:pointer-events-none!',
              )}
              onPointerDown={(e) => {
                if (isFetching) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={(row.original as any).id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80',
                    rowClassName?.(row.original),
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {!table.getRowModel().rows.length && (
                <TableRow className='bg-transparent!'>
                  <TableCell colSpan={columns.length} className='h-120 text-center hover:bg-none!'>
                    {isLoading ? <Spinner className={cn('size-12 mx-auto')} /> : emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </UITable>
          {!isLoading && isFetching && (
            <Spinner className='size-12 absolute top-1/2 left-1/2 -translate-1/2 opacity-30' />
          )}
        </div>
        <TableFooter table={table} />
      </div>
    </div>
  );
}
