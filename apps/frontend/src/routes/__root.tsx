import { createRootRoute, Outlet } from '@tanstack/react-router';
import GlobalAlertDialog from '@/components/global/global-alert.dialog.';
import { ZodFormDialog } from '@/components/global/zod-form.dialog';
import { ZodFormDrawer } from '@/components/global/zod-form.drawer';
import GlobalPreviewFile from '@/components/previewFile/global-preview-file';
import { DateFormatProvider } from '@/contexts/date-format-context';
import { useConnectionStatus } from '@/hooks/use-connection-status';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useConnectionStatus();

  return (
    <DateFormatProvider>
      <div className='block w-dvw h-dvh relative overflow-x-hidden'>
        <Outlet />
      </div>
      <GlobalAlertDialog />
      <GlobalPreviewFile />
      <ZodFormDialog />
      <ZodFormDrawer />
    </DateFormatProvider>
  );
}
