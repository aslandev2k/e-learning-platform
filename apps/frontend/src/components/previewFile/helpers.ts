/**
 * Helper functions for file preview components
 */

/**
 * Format file size from bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

/**
 * Validate page number for PDF navigation
 */
export const validatePageNumber = (value: string, numPages: number | null): number | null => {
  const pageNum = parseInt(value, 10);
  if (!Number.isNaN(pageNum) && pageNum >= 1 && numPages && pageNum <= numPages) {
    return pageNum;
  }
  return null;
};

/**
 * Navigate to previous page with bounds checking
 */
export const getPreviousPage = (currentPage: number): number => {
  return Math.max(currentPage - 1, 1);
};

/**
 * Navigate to next page with bounds checking
 */
export const getNextPage = (currentPage: number, numPages: number | null): number => {
  if (!numPages) return currentPage;
  return Math.min(currentPage + 1, numPages);
};

/**
 * Load image and return URL on success
 */
export const loadImage = (
  downloadUrl: string,
  onSuccess: (url: string) => void,
  onError: (error: string) => void,
): void => {
  const img = new Image();
  img.onload = () => {
    onSuccess(downloadUrl);
  };
  img.onerror = () => {
    onError('Không thể xem trước ảnh.');
  };
  img.src = downloadUrl;
};

/**
 * Fetch file as array buffer for DOCX preview
 */
export const fetchFileAsBuffer = async (downloadUrl: string): Promise<ArrayBuffer> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.arrayBuffer();
};
