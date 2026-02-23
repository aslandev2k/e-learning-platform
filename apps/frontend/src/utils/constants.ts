import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const FileType = {
  IMAGE: 'IMAGE',
  PDF: 'PDF',
  WORD: 'WORD',
  EXCEL: 'EXCEL',
  UNSUPPORTED: 'UNSUPPORTED',
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

export const getFileType = (contentType: string): FileType => {
  if (contentType.startsWith('image/')) {
    return FileType.IMAGE;
  }
  if (contentType === 'application/pdf') {
    return FileType.PDF;
  }
  if (
    contentType === 'application/msword' ||
    contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return FileType.WORD;
  }
  if (
    contentType === 'application/vnd.ms-excel' ||
    contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return FileType.EXCEL;
  }
  return FileType.UNSUPPORTED;
};

// Format date as dd/MM/yyyy (đảm bảo độ dài cố định)
export const formatDateVN = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return format(dateObj, 'dd/MM/yyyy', { locale: vi });
};

// Format date and time as HH:mm dd/MM/yyyy (đảm bảo độ dài cố định)
export const formatDateTimeVN = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return format(dateObj, 'HH:mm dd/MM/yyyy', { locale: vi });
};

// Check if file is an image based on content type
export const isImageFile = (contentType: string): boolean => {
  return contentType.startsWith('image/');
};

// Generate year options (2025 - current year + 1)
export const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - 1 + i;
  return { value: year.toString(), label: year.toString() };
});
