import { toast } from 'sonner';

/**
 * Upload file to S3 using pre-signed URL
 * @param uploadLink - Pre-signed S3 upload URL from backend
 * @param file - File to upload
 * @returns Result object with success flag and optional error info
 */
export async function uploadFileToS3(
  uploadLink: string,
  file: File,
): Promise<{ success: boolean; data?: { fileName: string }; error?: string }> {
  const id = file.name;

  // Show loading toast
  toast.loading(`Đang tải tệp ${file.name} lên máy chủ`, { id });

  try {
    const response = await fetch(uploadLink, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      toast.error(`Tải tệp ${file.name} lên máy chủ thất bại`, { id });
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    toast.success(`Tải tệp ${file.name} lên máy chủ thành công`, { id, duration: 2000 });
    return {
      success: true,
      data: { fileName: file.name },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`Tải file ${file.name} lên máy chủ thất bại!`, { id });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Upload multiple files to S3 in parallel
 * @param uploadLinks - Array of {fileName, uploadLink} from API response
 * @param files - Array of File objects to upload
 * @returns Array of results for each file
 */
export async function uploadFilesToS3Parallel(
  uploadLinks: Array<{ fileName: string; uploadLink: string }>,
  files: File[],
): Promise<Array<{ success: boolean; data?: { fileName: string }; error?: string }>> {
  const uploadPromises = uploadLinks.map((link, index) =>
    uploadFileToS3(link.uploadLink, files[index]),
  );

  const results = await Promise.all(uploadPromises);
  return results;
}

/**
 * Check if all uploads were successful
 * @param results - Array of upload results
 * @returns True if all uploads succeeded
 */
export function allUploadsSuccessful(results: Array<{ success: boolean }>): boolean {
  return results.every((result) => result.success);
}
