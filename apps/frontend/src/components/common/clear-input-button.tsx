import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ClearInputButton = ({ onClear, className }: { onClear: () => void; className?: string }) => {
  return (
    <Button
      variant='ghost'
      className={cn(
        'rounded-full p-1! h-fit w-fit leading-0 cursor-pointer pointer-events-auto hover:*:stroke-destructive',
        'opacity-50 hover:opacity-100',
        className,
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClear();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <XIcon />
    </Button>
  );
};

export default ClearInputButton;
