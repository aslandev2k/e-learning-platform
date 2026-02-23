import { useEffect, useState } from 'react';
import { downloadFile } from '@/utils/file-download';
import { formatFileSize, loadImage } from './helpers';
import type { FileInfo } from './preview-ui-states';
import { PreviewErrorState, PreviewHeader, PreviewLoadingState } from './preview-ui-states';

interface PreviewImageProps {
  file: FileInfo;
  onClose: () => void;
}

const PreviewImage = ({ file, onClose }: PreviewImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    loadImage(
      file.downloadUrl,
      (url) => {
        setImageUrl(url);
        setIsLoading(false);
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
      },
    );
  }, [file.downloadUrl]);

  const handleDownload = async () => {
    await downloadFile(file.downloadUrl, file.fileName);
  };

  return (
    <>
      <PreviewHeader
        file={file}
        formattedSize={formatFileSize(file.fileSize)}
        onDownload={handleDownload}
        onClose={onClose}
      />

      <div className='h-[calc(100%-64px)] flex flex-col overflow-hidden'>
        <div className='flex-1 flex items-center justify-center p-6 bg-muted/50 overflow-auto'>
          {isLoading && <PreviewLoadingState message='Đang tải ảnh...' />}

          {error && <PreviewErrorState error={error} file={file} onDownload={handleDownload} />}

          {!isLoading && !error && imageUrl && (
            <img
              src={imageUrl}
              alt={file.fileName}
              className='max-w-full max-h-full object-contain'
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PreviewImage;
