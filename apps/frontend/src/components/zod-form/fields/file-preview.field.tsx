import { Download, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import { AsyncButton } from '@/components/async-button';
import { FileIcon } from '@/components/file-icon';
import { openPreviewAttachment } from '@/components/previewFile/global-preview-file';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/utils/file-download';

export interface ExistingFile {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
}

interface FilePreviewFieldProps {
  formField: ControllerRenderProps<any, any>;
  disabled?: boolean;
  readOnly?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilePreviewField = ({ formField, disabled, readOnly }: FilePreviewFieldProps) => {
  const currentFiles: ExistingFile[] = formField.value ?? [];

  // Track deleted files for undo functionality
  const [deletedFiles, setDeletedFiles] = useState<ExistingFile[]>([]);

  const handleDelete = (file: ExistingFile) => {
    if (readOnly) return;
    const updatedFiles = currentFiles.filter((f) => f.id !== file.id);
    formField.onChange(updatedFiles);
    setDeletedFiles((prev) => [...prev, file]);
  };

  const handleUndo = (file: ExistingFile) => {
    const updatedFiles = [...currentFiles, file].sort((a, b) => a.id - b.id);
    formField.onChange(updatedFiles);
    setDeletedFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const handleDownload = async (file: ExistingFile) => {
    try {
      await downloadFile(file.downloadUrl, file.fileName);
      toast.success('Tải file thành công');
    } catch {
      toast.error('Lỗi khi tải file');
    }
  };

  if (currentFiles.length === 0 && deletedFiles.length === 0) {
    return (
      <div className='text-muted-foreground text-sm py-4 text-center border rounded-lg border-dashed'>
        Không có tài liệu đính kèm
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-2'>
      {/* Current files */}
      {currentFiles.map((file) => (
        <div
          key={file.id}
          className={cn(
            'flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors',
            disabled && 'opacity-50 pointer-events-none',
          )}
        >
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <FileIcon contentType={file.contentType} />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{file.fileName}</p>
              <p className='text-xs text-muted-foreground'>{formatFileSize(file.fileSize)}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8'
              onClick={() => openPreviewAttachment(file)}
              disabled={disabled}
            >
              <Eye className='size-4' />
            </Button>
            <AsyncButton
              type='button'
              variant='ghost'
              size='icon'
              className='size-8'
              onClick={() => handleDownload(file)}
              disabled={disabled}
            >
              <Download className='size-4' />
            </AsyncButton>
            {!readOnly && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 text-destructive hover:text-destructive'
                onClick={() => handleDelete(file)}
                disabled={disabled}
              >
                <Trash2 className='size-4' />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Deleted files with undo option */}
      {deletedFiles.map((file) => (
        <div
          key={`deleted-${file.id}`}
          className={cn(
            'flex items-center justify-between p-3 border border-dashed rounded-lg bg-muted/50 opacity-60',
            disabled && 'pointer-events-none',
          )}
        >
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <FileIcon contentType={file.contentType} isDeleted />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate line-through text-muted-foreground'>
                {file.fileName}
              </p>
              <p className='text-xs text-muted-foreground'>Sẽ bị xóa khi lưu</p>
            </div>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='gap-1 text-primary hover:text-primary'
            onClick={() => handleUndo(file)}
            disabled={disabled}
          >
            <RotateCcw className='size-4' />
            Hoàn tác
          </Button>
        </div>
      ))}
    </div>
  );
};

export default FilePreviewField;
