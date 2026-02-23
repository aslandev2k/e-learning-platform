import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/client-logger';
import { EventBusName, eventBus } from '@/lib/event-bus';
import { delay } from '@/lib/timeValue';

interface AlertProps {
  title: ReactNode;
  description?: ReactNode;
  body?: ReactNode;
  footer?: (setOpen: React.Dispatch<React.SetStateAction<boolean>>) => ReactNode;
}
export const showAlert = (props: AlertProps, delayMs = 100) =>
  delay(delayMs).then(() => eventBus.emit(EventBusName.SHOW_ALERT, props));

const GlobalAlertDialog = () => {
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<AlertProps>();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpenDialog = (alertProps: AlertProps) => {
      logger.info('logger ~ GlobalAlertDialog.tsx ~ line 31 ~ onOpenDialog  ');
      setProps(alertProps);
      setOpen(true);
    };

    eventBus.on(EventBusName.SHOW_ALERT, onOpenDialog);
    return () => {
      eventBus.off(EventBusName.SHOW_ALERT, onOpenDialog);
    };
  }, []);

  useEffect(() => {
    if (!open) setProps(undefined);

    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) setOpen(false);
    };
    if (open) window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  if (!props) return null;

  const { title, description, footer, body } = props;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent ref={contentRef}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {body}
        <AlertDialogFooter className={'w-full h-fit text-right'}>
          {footer ? (
            footer(setOpen)
          ) : (
            <Button
              onClick={() => {
                setOpen(false);
              }}
            >
              OK
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GlobalAlertDialog;
