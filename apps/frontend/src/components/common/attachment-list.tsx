import type { Attachment } from '@repo/zod-schemas/src/common';
import { Download, Eye } from 'lucide-react';
import { AsyncButton } from '@/components/async-button';
import { FileIcon } from '@/components/file-icon';
import { openPreviewAttachment } from '@/components/previewFile/global-preview-file';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/utils/file-download';

type AttachmentListProps = {
  files: Attachment[];
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ files }: AttachmentListProps) {
  if (files.length === 0) {
    return <div className='text-sm text-muted-foreground italic'>Không có tài liệu đính kèm</div>;
  }

  const handlePreview = (file: Attachment) => {
    openPreviewAttachment(file);
  };

  return (
    <div className='grid grid-cols-1 gap-2'>
      {files.map((file) => (
        <div
          key={file.id}
          className='flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors'
        >
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <FileIcon contentType={file.contentType} />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{file.fileName}</p>
              <p className='text-xs text-muted-foreground'>{formatFileSize(file.fileSize)}</p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='size-8'
              title='Xem file'
              onClick={() => handlePreview(file)}
            >
              <Eye className='size-4' />
            </Button>
            <AsyncButton
              variant='ghost'
              size='icon'
              className='size-8'
              title='Tải xuống'
              onClick={() => downloadFile(file.downloadUrl, file.fileName)}
            >
              <Download className='size-4' />
            </AsyncButton>
          </div>
        </div>
      ))}
    </div>
  );
}
