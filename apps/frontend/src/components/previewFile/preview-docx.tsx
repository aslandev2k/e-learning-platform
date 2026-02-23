import { renderAsync } from 'docx-preview';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/utils/file-download';
import { fetchFileAsBuffer, formatFileSize } from './helpers';
import type { FileInfo } from './preview-ui-states';
import { PreviewErrorState, PreviewHeader, PreviewLoadingState } from './preview-ui-states';

interface PreviewDocxProps {
  file: FileInfo;
  onClose: () => void;
}

const PreviewDocx = ({ file, onClose }: PreviewDocxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const loadDocx = async () => {
      try {
        const buffer = await fetchFileAsBuffer(file.downloadUrl);

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';

          // Render the document
          await renderAsync(buffer, containerRef.current, undefined, {
            className: 'docx-preview-wrapper',
            inWrapper: true,
            debug: true,
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading DOCX:', err);
        setError('Không thể xem trước tài liệu!');
        setIsLoading(false);
      }
    };

    loadDocx();
  }, [file.downloadUrl]);

  const handleDownload = async () => {
    await downloadFile(file.downloadUrl, file.fileName);
  };

  return (
    <>
      {/* Header - Fixed height */}
      <PreviewHeader
        file={file}
        formattedSize={formatFileSize(file.fileSize)}
        onDownload={handleDownload}
        onClose={onClose}
      />

      {/* Body - fullscreen minus header height */}
      <div className='h-[calc(100%-64px)] flex flex-col overflow-hidden'>
        {(isLoading || error) && (
          <div className='flex-1 flex items-center justify-center bg-muted/50 overflow-auto p-4'>
            {isLoading && <PreviewLoadingState message='Đang tải tài liệu...' />}

            {error && <PreviewErrorState error={error} file={file} onDownload={handleDownload} />}
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            'docx-preview-container h-full overflow-auto',
            (isLoading || error) && 'hidden',
          )}
        />
      </div>
    </>
  );
};

export default PreviewDocx;
