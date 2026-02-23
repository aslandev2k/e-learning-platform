import { useBlocker } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventBusName, eventBus } from '@/lib/event-bus';
import { FileType, getFileType } from '@/utils/constants';
import PreviewDocx from './preview-docx';
import PreviewExcel from './preview-excel';
import PreviewImage from './preview-image';
import PreviewPdf from './preview-pdf';

export type FileInfo = {
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
};

export const openPreviewAttachment = (info: FileInfo) => {
  eventBus.emit(EventBusName.OPEN_PREVIEW_FILE, info);
};

const GlobalPreviewFile = () => {
  const [open, setOpen] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const handleClose = () => {
    setOpen(false);
    setFileInfo(null);
  };

  // Block back navigation when preview is open — close dialog instead
  useBlocker({
    shouldBlockFn: () => {
      if (open) {
        handleClose();
        return true;
      }
      return false;
    },
    disabled: !open,
  });

  useEffect(() => {
    const onOpenDialog = (data: FileInfo) => {
      const fileType = getFileType(data.contentType);
      if (
        fileType !== null &&
        !([FileType.IMAGE, FileType.PDF, FileType.WORD, FileType.EXCEL] as FileType[]).includes(
          fileType,
        )
      ) {
        toast.error('Loại file này chưa được hỗ trợ xem trước!');
        return;
      }
      setFileInfo(data);
      setOpen(true);
    };
    eventBus.on(EventBusName.OPEN_PREVIEW_FILE, onOpenDialog);
    return () => {
      eventBus.off(EventBusName.OPEN_PREVIEW_FILE, onOpenDialog);
    };
  }, []);

  const fileType = fileInfo ? getFileType(fileInfo.contentType) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className='w-screen min-w-screen h-dvh max-w-none p-0 rounded-none'
        showCloseButton={false}
      >
        <DialogHeader className='sr-only'>
          <DialogTitle className='sr-only'>Preview File</DialogTitle>
        </DialogHeader>
        <div className='w-screen h-dvh overflow-hidden relative'>
          {fileInfo && fileType === FileType.IMAGE && (
            <PreviewImage file={fileInfo} onClose={handleClose} />
          )}
          {fileInfo && fileType === FileType.PDF && (
            <PreviewPdf file={fileInfo} onClose={handleClose} />
          )}
          {fileInfo && fileType === FileType.WORD && (
            <PreviewDocx file={fileInfo} onClose={handleClose} />
          )}
          {fileInfo && fileType === FileType.EXCEL && (
            <PreviewExcel file={fileInfo} onClose={handleClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalPreviewFile;
