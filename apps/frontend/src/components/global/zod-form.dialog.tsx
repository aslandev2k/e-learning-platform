import { type ReactNode, useEffect, useState } from 'react';
import type { ZodObject } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ZodFormProps } from '@/components/zod-form/zod-form';
import ZodForm from '@/components/zod-form/zod-form';
import { EventBusName, eventBus } from '@/lib/event-bus';

type ZodFromDialogProps<T> = T & {
  title: string;
  description?: ReactNode;
  body?: ReactNode;
};

export const ZodFormDialogEvent = {
  openDialog: <T extends ZodObject, D = any>(data: ZodFromDialogProps<ZodFormProps<T, D>>) =>
    eventBus.emit(EventBusName.OPEN_ZOD_FORM_DIALOG, data),
  close: () => eventBus.emit(EventBusName.CLOSE_ZOD_FORM_DIALOG),
};

export const openZodFormDialog = ZodFormDialogEvent.openDialog;

export function ZodFormDialog<T extends ZodObject, D = any>() {
  const [data, setZodFormDialogProps] = useState<
    ZodFromDialogProps<ZodFormProps<T, D>> | undefined
  >();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onOpenDialog = (data: ZodFromDialogProps<ZodFormProps<T, D>>) => {
      setZodFormDialogProps(data);
      setIsOpen(true);
    };

    const onCloseDialog = () => {
      setIsOpen(false);
      setZodFormDialogProps(undefined);
    };

    eventBus.on(EventBusName.OPEN_ZOD_FORM_DIALOG, onOpenDialog);
    eventBus.on(EventBusName.CLOSE_ZOD_FORM_DIALOG, onCloseDialog);

    return () => {
      eventBus.off(EventBusName.OPEN_ZOD_FORM_DIALOG, onOpenDialog);
      eventBus.off(EventBusName.CLOSE_ZOD_FORM_DIALOG, onCloseDialog);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className='sm:max-w-125 max-sm:max-w-full max-sm:max-h-full max-sm:overflow-y-auto'
        onInteractOutside={(event) => {
          if (data?.dialogOptions?.blockOutsideClick) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{data?.title}</DialogTitle>
          <DialogDescription>{data?.description || ''}</DialogDescription>
        </DialogHeader>
        {data?.body}
        {data && <ZodForm {...data} />}
      </DialogContent>
    </Dialog>
  );
}
