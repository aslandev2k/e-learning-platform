import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import * as React from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimePickerProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  formField: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
}

const DateTimePicker = React.forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ formField, disabled = false, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const date = formField.value ? new Date(formField.value) : undefined;

    // Handle date selection from calendar
    const handleDateSelect = (selectedDate: Date | undefined) => {
      if (!selectedDate) return;

      // Preserve time from input or use current time
      const currentTime = date ? new Date(date) : new Date();
      selectedDate.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds(),
      );

      formField.onChange(selectedDate);
      setOpen(false);
    };

    // Handle time input change
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const timeValue = e.target.value;
      if (!timeValue) return;

      const [hours, minutes, seconds] = timeValue.split(':').map(Number);
      const newDate = date ? new Date(date) : new Date();
      newDate.setHours(hours, minutes, seconds || 0);

      formField.onChange(newDate);
    };

    // Format date for calendar picker
    const displayDate = date ? format(date, 'PPP') : 'Chọn ngày';

    // Format time for time input (HH:mm:ss)
    const timeValue = date ? format(date, 'HH:mm:ss') : '00:00:00';

    return (
      <div className='flex gap-2'>
        {/* Date Picker */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              disabled={disabled}
              className='min-w-48 max-w-48 justify-between font-normal'
            >
              {displayDate}
              <ChevronDownIcon className='h-4 w-4 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={date}
              onSelect={handleDateSelect}
              defaultMonth={date}
              captionLayout='dropdown'
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>

        {/* Time Input */}
        <Input
          {...props}
          ref={ref}
          type='time'
          value={timeValue.substring(0, 5)}
          onChange={handleTimeChange}
          disabled={disabled}
          step='1'
          className={cn('w-48', {
            'cursor-not-allowed select-none': disabled,
          })}
        />
      </div>
    );
  },
);

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
