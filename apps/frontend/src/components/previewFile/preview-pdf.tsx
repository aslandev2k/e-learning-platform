import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { downloadFile } from '@/utils/file-download';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
// Set PDF worker from pdfjs-dist
// @ts-expect-error - pdfjs-dist worker module has no type definitions but works at runtime
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js';
import { logger } from '@/lib/client-logger';
import { formatFileSize, getNextPage, getPreviousPage, validatePageNumber } from './helpers';
import type { FileInfo } from './preview-ui-states';
import { PreviewErrorState, PreviewHeader, PreviewLoadingState } from './preview-ui-states';

if (typeof pdfjsWorker.WorkerMessageHandler !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface PreviewPdfProps {
  file: FileInfo;
  onClose: () => void;
}

const PreviewPdf = ({ file, onClose }: PreviewPdfProps) => {
  logger.info('logger ~ preview-pdf.tsx ~ line 23:', file);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const onDocumentLoadSuccess = ({ numPages: num }: { numPages: number }) => {
    setNumPages(num);
    setCurrentPage(1);
  };

  const onDocumentLoadError = (e: Error) => {
    logger.error('logger ~ preview-pdf.tsx ~ line 39:', e);
    setError('Không thể xem trước PDF. Vui lòng thử lại hoặc tải xuống file.');
  };

  const handleDownload = async () => {
    await downloadFile(file.downloadUrl, file.fileName);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => getPreviousPage(prev));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => getNextPage(prev, numPages));
  };

  const handlePageInputChange = (value: string) => {
    const validatedPage = validatePageNumber(value, numPages);
    if (validatedPage !== null) {
      setCurrentPage(validatedPage);
    }
  };

  return (
    <>
      <PreviewHeader
        file={file}
        formattedSize={formatFileSize(file.fileSize)}
        onDownload={handleDownload}
        onClose={onClose}
      />

      <div className='h-[calc(100%-64px)] flex flex-col overflow-hidden relative'>
        <div className='flex-1 flex items-center justify-center gap-4 p-4 bg-muted/50 overflow-hidden'>
          {error && <PreviewErrorState error={error} file={file} onDownload={handleDownload} />}

          {!error && (
            <>
              <div className='absolute top-0 left-0 right-0 z-40'>
                {loadProgress > 0 && loadProgress < 100 && (
                  <Progress value={loadProgress} className='flex-1 rounded-none' />
                )}
              </div>

              <Document
                file={file.downloadUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                onLoadProgress={({ loaded, total }) => {
                  const progress = Math.round((loaded / total) * 100);
                  setLoadProgress(progress);
                }}
                loading={<PreviewLoadingState message='Đang tải trang...' />}
                error={
                  <PreviewErrorState error='Lỗi tải PDF' file={file} onDownload={handleDownload} />
                }
                className='max-h-full overflow-auto'
              >
                <Page pageNumber={currentPage} scale={1.5} className='shadow-lg' />
              </Document>

              <div className='absolute flex bottom-12 left-1/2 -translate-x-1/2 bg-background p-0 z-50 rounded-md'>
                {numPages && numPages > 1 && (
                  <div className='flex items-center gap-4'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={goToPreviousPage}
                      disabled={currentPage <= 1}
                      className='size-8'
                      title='Trang trước'
                    >
                      <ChevronLeft className='size-4' />
                    </Button>

                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        min='1'
                        max={numPages}
                        value={currentPage}
                        onChange={(e) => handlePageInputChange(e.target.value)}
                        className='w-12 px-2 py-1 text-center text-sm border rounded'
                      />
                      <span className='text-sm text-muted-foreground'>/ {numPages}</span>
                    </div>

                    <Button
                      variant='outline'
                      size='icon'
                      onClick={goToNextPage}
                      disabled={currentPage >= numPages}
                      className='size-8'
                      title='Trang tiếp'
                    >
                      <ChevronRight className='size-4' />
                    </Button>
                  </div>
                )}

                {numPages && numPages === 1 && (
                  <div className='mt-4 text-xs text-muted-foreground'>1 trang</div>
                )}
              </div>
              {/* Footer Controls */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PreviewPdf;
