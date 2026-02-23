import { CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MetadataFooterProps = {
  createdAt?: Date | string;
  updatedAt?: Date | string;
  className?: string;
};

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MetadataFooter({ createdAt, updatedAt, className }: MetadataFooterProps) {
  if (!createdAt && !updatedAt) return null;

  return (
    <CardFooter className={cn('flex-col gap-1 items-end justify-end', className)}>
      {createdAt && (
        <p className='text-xs text-muted-foreground'>
          Ngày tạo:{' '}
          <span className='font-medium'>
            {formatTime(createdAt)} {formatDate(createdAt)}
          </span>
        </p>
      )}
      {updatedAt && (
        <p className='text-xs text-muted-foreground'>
          Cập nhật lần cuối:{' '}
          <span className='font-medium'>
            {formatTime(updatedAt)} {formatDate(updatedAt)}
          </span>
        </p>
      )}
    </CardFooter>
  );
}
