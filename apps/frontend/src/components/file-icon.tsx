import { FileQuestion, FileSpreadsheet, FileText, Image as ImageIcon } from 'lucide-react';
import { FileType, getFileType } from '@/utils/constants';

interface FileIconProps {
  contentType: string;
  isDeleted?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FileIcon({ contentType, isDeleted = false, size = 'md' }: FileIconProps) {
  const fileType = getFileType(contentType);
  const sizeClass = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  }[size];

  const baseClass = `${sizeClass} shrink-0`;
  const mutedClass = isDeleted ? 'text-muted-foreground' : '';

  switch (fileType) {
    case FileType.EXCEL:
      return <FileSpreadsheet className={`${baseClass} text-green-500 ${mutedClass}`} />;
    case FileType.WORD:
      return <FileText className={`${baseClass} text-blue-500 ${mutedClass}`} />;
    case FileType.PDF:
      return <FileText className={`${baseClass} text-red-500 ${mutedClass}`} />;
    case FileType.IMAGE:
      return <ImageIcon className={`${baseClass} text-purple-500 ${mutedClass}`} />;
    default:
      return <FileQuestion className={`${baseClass} text-gray-500 ${mutedClass}`} />;
  }
}
