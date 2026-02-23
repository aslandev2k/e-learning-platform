/**
 * File Download APIs - Public testing APIs that support various file types
 * Used for development and testing purposes
 */

export const FILE_DOWNLOAD_APIS = {
  // HTTPBin - Public HTTP service for testing
  // Returns sample files in different formats
  pdf: 'https://httpbin.org/image/webp',
  image: {
    png: 'https://httpbin.org/image/png',
    jpeg: 'https://httpbin.org/image/jpeg',
    gif: 'https://httpbin.org/image/gif',
    webp: 'https://httpbin.org/image/webp',
    svg: 'https://httpbin.org/image/svg',
  },
  // Note: HTTPBin returns image files for demonstration
  // In production, replace with actual document storage services (AWS S3, Google Cloud Storage, etc.)
  documents: {
    docx: 'https://httpbin.org/image/png', // Placeholder - returns image
    xlsx: 'https://httpbin.org/image/jpeg', // Placeholder - returns image
    doc: 'https://httpbin.org/image/png', // Placeholder - returns image
    xls: 'https://httpbin.org/image/jpeg', // Placeholder - returns image
  },
} as const;

/**
 * Get appropriate download URL based on file type
 * @param contentType - MIME type of the file
 * @returns Download URL from public API
 */
export const getDownloadUrlByContentType = (contentType: string): string => {
  switch (contentType) {
    case 'application/pdf':
      return FILE_DOWNLOAD_APIS.pdf;
    case 'image/png':
      return FILE_DOWNLOAD_APIS.image.png;
    case 'image/jpeg':
      return FILE_DOWNLOAD_APIS.image.jpeg;
    case 'image/gif':
      return FILE_DOWNLOAD_APIS.image.gif;
    case 'image/webp':
      return FILE_DOWNLOAD_APIS.image.webp;
    case 'image/svg+xml':
      return FILE_DOWNLOAD_APIS.image.svg;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return FILE_DOWNLOAD_APIS.documents.docx;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return FILE_DOWNLOAD_APIS.documents.xlsx;
    default:
      return FILE_DOWNLOAD_APIS.pdf; // Default to PDF
  }
};

/**
 * Mock file download with simulated delay
 * @param url - File URL to download
 * @param fileName - Name for the downloaded file
 * @returns Promise that resolves when download is initiated
 */
export const simulateFileDownload = async (url: string, fileName: string): Promise<void> => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch file from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Create blob from response
    const blob = await response.blob();

    // Create download link and trigger download
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('File download error:', error);
    throw error;
  }
};

/**
 * Batch download multiple files (creates zip or downloads sequentially)
 * @param files - Array of files to download
 */
export const downloadMultipleFiles = async (
  files: Array<{ url: string; fileName: string }>,
): Promise<void> => {
  for (const file of files) {
    await simulateFileDownload(file.url, file.fileName);
    // Add delay between downloads to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
