import { AlertTriangle, Download, X } from 'lucide-react';
import { AsyncButton } from '@/components/async-button';
import { ModeToggle } from '@/components/mode-toggle';
import Typography from '@/components/typography';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export type FileInfo = {
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
};

interface PreviewHeaderProps {
  file: FileInfo;
  formattedSize: string;
  onDownload: () => Promise<void>;
  onClose: () => void;
}

export const PreviewHeader = ({ file, formattedSize, onDownload, onClose }: PreviewHeaderProps) => (
  <header className='sticky top-0 z-50 bg-background'>
    <div className='flex items-center justify-between px-6 py-4 border-b'>
      <div className='flex-1'>
        <h3 className='font-semibold text-sm truncate'>{file.fileName}</h3>
        <p className='text-xs text-muted-foreground mt-1'>{formattedSize}</p>
      </div>
      <div className='flex items-center gap-2 ml-4'>
        <ModeToggle />
        <AsyncButton
          variant='ghost'
          size='icon'
          onClick={onDownload}
          className='size-8'
          title='Tải xuống'
        >
          <Download className='size-4' />
        </AsyncButton>
        <Button variant='ghost' size='icon' onClick={onClose} className='size-8' title='Đóng'>
          <X className='size-4' />
        </Button>
      </div>
    </div>
  </header>
);

interface PreviewLoadingStateProps {
  message?: string;
}

export const PreviewLoadingState = ({ message = 'Đang tải tệp...' }: PreviewLoadingStateProps) => (
  <div className='text-center'>
    <Spinner className='inline-block size-8 animation-duration-[2s]' />
    <p className='mt-2 text-sm text-muted-foreground'>{message}</p>
  </div>
);

interface PreviewErrorStateProps {
  error: string;
  file: FileInfo;
  onDownload: () => Promise<void>;
}

export const PreviewErrorState = ({ error, file, onDownload }: PreviewErrorStateProps) => (
  <div className='text-center space-y-4'>
    <p className='text-sm text-destructive font-medium'>{error}</p>
    <p className='text-xs text-muted-foreground'>
      <AsyncButton onClick={onDownload} variant={'link'}>
        <Download className='size-3' />
        Tải xuống file
      </AsyncButton>
    </p>

    <Alert variant='warning' className='max-w-md mx-auto text-left'>
      <AlertTriangle className='size-4' />
      <AlertTitle>Cảnh báo</AlertTitle>
      <AlertDescription>
        <p className='mb-3'>
          File có thể không tồn tại hoặc định dạng không hợp lệ. Vui lòng cân nhắc trước khi tải.
        </p>
        <div className='space-y-1 text-xs'>
          <p>
            <span className='font-medium'>Tên file:</span> {file.fileName}
          </p>
          <p>
            <span className='font-medium'>Dung lượng:</span>{' '}
            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <p>
            <span className='font-medium'>Định dạng:</span> {file.contentType}
          </p>
          <p className='break-all'>
            <span className='font-medium'>Link tải xuống:</span>{' '}
            <Typography.code className='text-xs'>{file.downloadUrl}</Typography.code>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

interface PreviewContainerProps {
  isLoading: boolean;
  error: string | null;
  file: FileInfo;
  onDownload: () => Promise<void>;
  children: React.ReactNode;
}

export const PreviewContainer = ({
  isLoading,
  error,
  file,
  onDownload,
  children,
}: PreviewContainerProps) => (
  <div className='flex-1 flex items-center justify-center p-6 bg-muted/50 overflow-auto'>
    {isLoading && <PreviewLoadingState />}
    {error && <PreviewErrorState error={error} file={file} onDownload={onDownload} />}
    {!isLoading && !error && children}
  </div>
);
