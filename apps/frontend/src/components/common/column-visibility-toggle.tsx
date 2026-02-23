import type { VisibilityState } from '@tanstack/react-table';
import type { Table } from '@tanstack/react-table';
import { IconChevronDown, IconLayoutColumns } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STORAGE_KEY_PREFIX = 'table-column-visibility';

function getStorageKey(tableName: string) {
  return `${STORAGE_KEY_PREFIX}:${tableName}`;
}

function loadFromStorage(tableName: string): VisibilityState | undefined {
  try {
    const raw = localStorage.getItem(getStorageKey(tableName));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return undefined;
}

function saveToStorage(tableName: string, state: VisibilityState) {
  try {
    localStorage.setItem(getStorageKey(tableName), JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export type ColumnMeta = {
  header: string;
  enableHiding?: boolean;
  defaultVisible?: boolean;
};

/**
 * Derive default `VisibilityState` from a column meta map.
 * Only columns with `defaultVisible: false` (and `enableHiding !== false`) are included.
 */
export function deriveDefaultVisibility(columnMap: Record<string, ColumnMeta>): VisibilityState {
  const visibility: VisibilityState = {};
  for (const [key, meta] of Object.entries(columnMap)) {
    if (meta.enableHiding === false) continue;
    if (meta.defaultVisible === false) {
      visibility[key] = false;
    }
  }
  return visibility;
}

/**
 * Hook that manages column visibility state with localStorage persistence.
 * Returns [state, setter] — pass both to `useReactTable`'s
 * `state.columnVisibility` and `onColumnVisibilityChange`.
 */
export function useColumnVisibility(
  tableName: string,
  defaultVisibility: VisibilityState,
): [
  VisibilityState,
  (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void,
] {
  const [visibility, setVisibility] = useState<VisibilityState>(
    () => loadFromStorage(tableName) ?? defaultVisibility,
  );

  const handleChange = useCallback(
    (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      setVisibility((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveToStorage(tableName, next);
        return next;
      });
    },
    [tableName],
  );

  return [visibility, handleChange];
}

interface ColumnVisibilityToggleProps<TData> {
  table: Table<TData>;
  headerLabels?: Record<string, string>;
}

export function ColumnVisibilityToggle<TData>({
  table,
  headerLabels,
}: ColumnVisibilityToggleProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm'>
          <IconLayoutColumns />
          <span className='hidden lg:inline'>Ẩn/hiện cột</span>
          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className='capitalize'
            checked={column.getIsVisible()}
            onClick={(e) => {
              e.preventDefault();
              column.toggleVisibility(!column.getIsVisible());
            }}
          >
            {headerLabels?.[column.id] ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
