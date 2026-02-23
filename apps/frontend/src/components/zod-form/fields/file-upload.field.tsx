import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import { type ZodArray, type ZodFile, z } from 'zod';
import { FileIcon } from '@/components/file-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadFieldProps {
  formField: ControllerRenderProps<any, any>;
  disabled?: boolean;
  fieldSchema: ZodArray<ZodFile>;
}

type FilesSchema = ZodArray<ZodFile>;

interface FilePreview {
  file: File;
  preview?: string;
}

// Extract min/max from array schema (Zod v4)
const getArrayLimits = (schema: FilesSchema): { minFiles: number; maxFiles: number } => {
  const { minimum = 0, maximum = 1 } = schema._zod.bag;
  return {
    minFiles: minimum as number,
    maxFiles: maximum as number,
  };
};

// Extract MIME types from ZodFile schema and join for accept attribute
const getAcceptAttribute = (fileSchema: ZodFile): string => {
  const mimeTypes = (fileSchema as any)._zod?.bag?.mime as string[] | undefined;
  return mimeTypes?.join(',') ?? '';
};

const FileUploadField = ({ formField, disabled, fieldSchema }: FileUploadFieldProps) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { minFiles, maxFiles } = getArrayLimits(fieldSchema);
  const elementSchema = fieldSchema.element;
  const isMultiple = fieldSchema instanceof z.ZodArray;
  const acceptAttribute = getAcceptAttribute(elementSchema);

  const validateFile = (file: File): string | null => {
    const result = elementSchema.safeParse(file);
    if (result.success) {
      return null;
    }
    return result.error.issues[0]?.message ?? 'File không hợp lệ';
  };

  const processFiles = (selectedFiles: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];
    const existingFileNames = new Set(files.map((f) => f.file.name));
    const overwrittenNames: string[] = [];

    for (const file of selectedFiles) {
      if (existingFileNames.has(file.name)) {
        overwrittenNames.push(file.name);
      }

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    // Check max after accounting for overwrites
    const newFileCount = validFiles.filter((f) => !existingFileNames.has(f.name)).length;
    if (maxFiles !== Number.POSITIVE_INFINITY && files.length + newFileCount > maxFiles) {
      toast.error(`Chỉ được upload tối đa ${maxFiles} file`);
      return;
    }

    if (errors.length > 0) {
      for (const error of errors) {
        toast.error(error);
      }
    }

    if (validFiles.length === 0) return;

    if (overwrittenNames.length > 0) {
      toast.info(
        `Có ${overwrittenNames.length} file bị ghi đè do trùng tên: ${overwrittenNames.join(', ')}`,
      );
    }

    const newFilePreviews = validFiles.map((file) => {
      const preview: FilePreview = { file };

      if (file.type.startsWith('image/')) {
        preview.preview = URL.createObjectURL(file);
      }

      return preview;
    });

    // Replace duplicates, keep non-duplicates, append new files
    const validFileNames = new Set(validFiles.map((f) => f.name));
    const remainingFiles = files.filter((f) => !validFileNames.has(f.file.name));

    // Revoke object URLs for overwritten files
    for (const f of files) {
      if (validFileNames.has(f.file.name) && f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    }

    const updatedFiles = [...remainingFiles, ...newFilePreviews];
    setFiles(updatedFiles);

    // Return array or single file based on schema type
    if (isMultiple) {
      formField.onChange(updatedFiles.map((f) => f.file));
    } else {
      formField.onChange(updatedFiles[0]?.file ?? null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    e.currentTarget.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const isAtMax = maxFiles !== Number.POSITIVE_INFINITY && files.length >= maxFiles;
    if (!disabled && !isAtMax) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const isAtMax = maxFiles !== Number.POSITIVE_INFINITY && files.length >= maxFiles;
    if (disabled || isAtMax) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];

    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    if (isMultiple) {
      formField.onChange(updatedFiles.map((f) => f.file));
    } else {
      formField.onChange(updatedFiles[0]?.file ?? null);
    }
  };

  const getFileIcon = (file: File) => {
    return <FileIcon contentType={file.type} size='lg' />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  const isAtMax = maxFiles !== Number.POSITIVE_INFINITY && files.length >= maxFiles;

  return (
    <div className='flex w-full flex-col gap-3'>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          (disabled || isAtMax) && 'cursor-not-allowed opacity-50',
        )}
      >
        <input
          ref={inputRef}
          type='file'
          multiple={isMultiple}
          onChange={handleFileChange}
          disabled={disabled || isAtMax}
          className='sr-only'
          accept={acceptAttribute}
        />
        <Upload className='text-muted-foreground mb-2 h-8 w-8' />
        <p className='text-muted-foreground text-sm font-medium'>
          {isDragOver ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
        </p>
        {maxFiles !== Number.POSITIVE_INFINITY && (
          <p className='text-muted-foreground mt-1 text-xs'>
            {minFiles > 0 && `Tối thiểu ${minFiles} file • `}
            {files.length}/{maxFiles} file
          </p>
        )}
      </label>

      {files.length > 0 && (
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
          {files.map((filePreview, index) => {
            const { file, preview } = filePreview;

            return (
              <div
                key={file.name}
                className={cn(
                  'border-input bg-card hover:bg-accent group relative flex items-center gap-3 rounded-md border p-3 transition-colors',
                )}
              >
                <div className='shrink-0'>
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className='bg-muted h-12 w-12 rounded object-cover'
                    />
                  ) : (
                    <div className='bg-muted flex h-12 w-12 items-center justify-center rounded'>
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='text-foreground truncate text-sm font-medium'>{file.name}</p>
                  <p className='text-muted-foreground text-xs'>{formatFileSize(file.size)}</p>
                </div>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploadField;
