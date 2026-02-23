import { toast } from 'sonner';

/**
 * Download file from URL or open in new tab as fallback
 * @param url - URL of the file to download
 * @param fileName - Name of the file to save as
 * @returns Promise that resolves when download completes
 */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  const toastId = toast.loading(`Đang tải "${fileName}"...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    toast.success(`Tải "${fileName}" thành công`, { id: toastId, duration: 2000 });
  } catch {
    toast.error(`Tải "${fileName}" thất bại`, { id: toastId });
  }
}

/**
 * Download file from URL with loading state management
 * @param url - URL of the file to download
 * @param fileName - Name of the file to save as (optional)
 * @returns Object with state and methods to manage download
 */
export function useFileDownload() {
  return {
    download: async (url: string, fileName: string) => {
      try {
        await downloadFile(url, fileName);
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    },
  };
}

/**
 * Download multiple files sequentially
 * @param files - Array of {url, fileName} objects
 * @returns Array of download results
 */
export async function downloadMultipleFiles(
  files: Array<{ url: string; fileName: string }>,
): Promise<Array<{ success: boolean; error?: string }>> {
  const results: Array<{ success: boolean; error?: string }> = [];

  for (const file of files) {
    try {
      await downloadFile(file.url, file.fileName);
      results.push({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ success: false, error: errorMessage });
    }
  }

  return results;
}

/**
 * Download all files from attachment array
 * @param attachments - Array of attachment objects with downloadUrl and fileName fields
 * @param options - Options for field mapping
 * @returns Promise that resolves when all downloads are initiated
 */
export async function downloadAllAttachments(
  attachments: Array<{ downloadUrl: string; fileName: string }>,
): Promise<void> {
  if (!attachments || attachments.length === 0) {
    return;
  }

  const files = attachments.map((attachment) => ({
    url: attachment.downloadUrl,
    fileName: attachment.fileName,
  }));

  await downloadMultipleFiles(files);
}
