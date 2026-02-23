import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import type { Table } from '@tanstack/react-table';
import { Button, buttonVariantClasses } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TableFooterProps<T> {
  table: Table<T>;
  pageSizeOptions?: number[];
}

export function TableFooter<T>({
  table,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
}: TableFooterProps<T>) {
  return (
    <div className='flex items-center justify-end px-4'>
      <div className='flex w-full items-center gap-8 lg:w-fit'>
        <div className='hidden items-center gap-2 lg:flex'>
          <Label htmlFor='rows-per-page' className='text-sm font-medium'>
            Số bản ghi mỗi trang
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              size='sm'
              className={cn(buttonVariantClasses.ghost, 'w-20')}
              id='rows-per-page'
            >
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-fit items-center justify-center text-sm font-medium'>
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </div>
        <div className='ml-auto flex items-center gap-2 lg:ml-0'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to first page</span>
            <IconChevronsLeft />
          </Button>
          <Button
            variant='outline'
            className='size-8'
            size='icon'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to previous page</span>
            <IconChevronLeft />
          </Button>
          <Button
            variant='outline'
            className='size-8'
            size='icon'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to next page</span>
            <IconChevronRight />
          </Button>
          <Button
            variant='outline'
            className='hidden size-8 lg:flex'
            size='icon'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to last page</span>
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
