import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/utils/file-download';
import { fetchFileAsBuffer, formatFileSize } from './helpers';
import type { FileInfo } from './preview-ui-states';
import { PreviewErrorState, PreviewHeader, PreviewLoadingState } from './preview-ui-states';

interface PreviewExcelProps {
  file: FileInfo;
  onClose: () => void;
}

const PreviewExcel = ({ file, onClose }: PreviewExcelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const loadExcel = async () => {
      try {
        const buffer = await fetchFileAsBuffer(file.downloadUrl);
        const workbook = XLSX.read(buffer, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to HTML
        const html = XLSX.utils.sheet_to_html(worksheet, { editable: false });

        if (containerRef.current) {
          containerRef.current.innerHTML = html;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Excel:', err);
        setError('Không thể xem trước file Excel!');
        setIsLoading(false);
      }
    };

    loadExcel();
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
            {isLoading && <PreviewLoadingState message='Đang tải file Excel...' />}

            {error && <PreviewErrorState error={error} file={file} onDownload={handleDownload} />}
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            'excel-preview-container h-full overflow-auto p-4',
            (isLoading || error) && 'hidden',
          )}
        />
      </div>
    </>
  );
};

export default PreviewExcel;
