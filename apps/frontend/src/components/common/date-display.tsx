import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useDateFormat } from '@/contexts/date-format-context';
import { formatDateTimeVN, formatDateVN } from '@/utils/constants';

interface DateDisplayProps {
  date: Date | string | number;
  className?: string;
  showTooltip?: boolean;
}

export function DateDisplay({ date, className = '', showTooltip = true }: DateDisplayProps) {
  const { format, cycleFormat } = useDateFormat();

  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);

  let displayText = '';
  let tooltipText = '';

  if (format === 'date') {
    displayText = formatDateVN(dateObj);
    tooltipText = formatDateTimeVN(dateObj);
  } else if (format === 'datetime') {
    displayText = formatDateTimeVN(dateObj);
    tooltipText = formatDateVN(dateObj);
  } else {
    displayText = formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });
    tooltipText = formatDateTimeVN(dateObj);
  }

  return (
    <button
      onClick={cycleFormat}
      className={`bg-transparent border-none p-0 cursor-pointer hover:opacity-70 transition-opacity ${className}`}
      title={showTooltip ? tooltipText : undefined}
      type='button'
    >
      {displayText}
    </button>
  );
}
