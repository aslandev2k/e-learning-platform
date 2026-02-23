import { type ReactNode, useEffect, useState } from 'react';
import type { ZodObject } from 'zod';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { ZodFormProps } from '@/components/zod-form/zod-form';
import ZodForm from '@/components/zod-form/zod-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { EventBusName, eventBus } from '@/lib/event-bus';

type ZodFromDrawerProps<T> = T & {
  title: string;
  description?: ReactNode;
  body?: ReactNode;
};

export const ZodFormDrawerEvent = {
  openDrawer: <T extends ZodObject, D = any>(data: ZodFromDrawerProps<ZodFormProps<T, D>>) =>
    eventBus.emit(EventBusName.OPEN_ZOD_FORM_DRAWER, data),
  close: () => eventBus.emit(EventBusName.CLOSE_ZOD_FORM_DRAWER),
};

export const openZodFormDrawer = ZodFormDrawerEvent.openDrawer;

export function ZodFormDrawer<T extends ZodObject, D = any>() {
  const [data, setZodFormProps] = useState<ZodFromDrawerProps<ZodFormProps<T, D>> | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onOpenDialog = (data: ZodFromDrawerProps<ZodFormProps<T, D>>) => {
      setZodFormProps(data);
      setIsOpen(true);
    };

    const onCloseDialog = () => {
      setIsOpen(false);
      setZodFormProps(undefined);
    };

    eventBus.on(EventBusName.OPEN_ZOD_FORM_DRAWER, onOpenDialog);
    eventBus.on(EventBusName.CLOSE_ZOD_FORM_DRAWER, onCloseDialog);

    return () => {
      eventBus.off(EventBusName.OPEN_ZOD_FORM_DRAWER, onOpenDialog);
      eventBus.off(EventBusName.CLOSE_ZOD_FORM_DRAWER, onCloseDialog);
    };
  }, []);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isMobile ? 'bottom' : 'right'}>
      <DrawerContent
        // className='sm:max-w-[500px] max-sm:max-w-full max-sm:max-h-full max-sm:overflow-y-auto'
        onInteractOutside={() => {
          // if (data?.dialogOptions?.blockOutsideClick) event.preventDefault();
        }}
      >
        <DrawerHeader className='gap-1'>
          <DrawerTitle>{data?.title}</DrawerTitle>
          <DrawerDescription>{data?.description || ''}</DrawerDescription>
        </DrawerHeader>
        {data?.body}
        <div className='flex flex-col gap-4 overflow-y-auto px-4 text-sm'>
          {data && <ZodForm {...data} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
