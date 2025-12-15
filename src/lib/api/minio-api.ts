import { apiClient } from "./client";

/**
 * MinIO API for image uploads
 */
class MinioAPI {
  /**
   * Upload image to MinIO storage
   * @param file - Image file to upload (JPG, JPEG, PNG, GIF, WEBP, max 10MB)
   * @returns Image URL string
   */
  async uploadImage(file: File): Promise<string> {
    console.log(`🔍 [DEBUG] Uploading file: ${file.name}, Size: ${(file.size / 1024).toFixed(2)}KB (${(file.size / 1024 / 1024).toFixed(2)}MB), Type: ${file.type}`);

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      console.error(`❌ [DEBUG] Invalid file type: ${file.type}`);
      throw new Error("Only JPG, JPEG, PNG, GIF, and WEBP files are allowed");
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error(`❌ [DEBUG] File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 10MB)`);
      throw new Error("File size must be less than 10MB");
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log(`📤 [DEBUG] Sending request to /minio/upload`);
    const startTime = Date.now();

    try {
      const response = await apiClient.post<{
        statusCode: number;
        message: string;
        data: {
          fileName: string;
          downloadUrl: string;
        };
      }>("/minio/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [DEBUG] Upload successful: ${file.name}, Duration: ${duration}ms, URL: ${response.data.downloadUrl}`);

      if (response.statusCode !== 200) {
        console.error(`⚠️ [DEBUG] Non-200 status code: ${response.statusCode}, Message: ${response.message}`);
        throw new Error(response.message || "Upload failed");
      }

      return response.data.downloadUrl;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`❌ [DEBUG] Upload failed: ${file.name}, Duration: ${duration}ms`);
      console.error(`❌ [DEBUG] Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        status: (error as { response?: { status?: number } }).response?.status,
        statusText: (error as { response?: { statusText?: string } }).response?.statusText,
        data: (error as { response?: { data?: unknown } }).response?.data,
      });
      throw error;
    }
  }

  /**
   * Upload multiple images sequentially with progress tracking
   * @deprecated Use uploadImagesBulk for better performance (parallel uploads)
   * @param files - Array of image files
   * @param onProgress - Optional callback for tracking progress (current, total)
   * @returns Array of image URLs
   */
  async uploadImages(
    files: File[],
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await this.uploadImage(files[i]);
        results.push(url);

        if (onProgress) {
          onProgress(i + 1, files.length);
        }

        // Add a small delay between uploads to prevent overwhelming the server
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to upload file ${files[i].name}:`, error);
        throw error; // Stop on first error
      }
    }

    return results;
  }

  /**
   * Upload multiple images in parallel using bulk upload endpoint
   * @param files - Array of image files (JPG, JPEG, PNG, GIF, WEBP, max 10MB each)
   * @returns Object containing successful and failed uploads
   */
  async uploadImagesBulk(files: File[]): Promise<{
    successfulUploads: Array<{ fileName: string; downloadUrl: string }>;
    failedUploads: Array<{ fileName: string; reason: string }>;
    totalSuccess: number;
    totalFailed: number;
  }> {
    console.log(`🔍 [DEBUG] Bulk uploading ${files.length} files`);

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        console.error(`❌ [DEBUG] Invalid file type in bulk: ${file.name} (${file.type})`);
      }
      if (file.size > maxSize) {
        console.error(`❌ [DEBUG] File too large in bulk: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
    }

    // Build FormData with multiple files
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    console.log(`📤 [DEBUG] Sending bulk request to /minio/bulk-upload`);
    const startTime = Date.now();

    try {
      const response = await apiClient.post<{
        statusCode: number;
        message: string;
        data: {
          successfulUploads: Array<{ fileName: string; downloadUrl: string }>;
          failedUploads: Array<{ fileName: string; reason: string }>;
          totalSuccess: number;
          totalFailed: number;
        };
      }>("/minio/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [DEBUG] Bulk upload completed: Duration: ${duration}ms`);
      console.log(`✅ [DEBUG] Success: ${response.data.totalSuccess}, Failed: ${response.data.totalFailed}`);

      // Handle different status codes
      if (response.statusCode === 200) {
        // All files uploaded successfully
        console.log(`✅ [DEBUG] All ${response.data.totalSuccess} files uploaded successfully`);
        return response.data;
      } else if (response.statusCode === 207) {
        // Partial success
        console.warn(`⚠️ [DEBUG] Partial success: ${response.data.totalSuccess} succeeded, ${response.data.totalFailed} failed`);
        return response.data;
      } else if (response.statusCode === 400) {
        // All files failed
        console.error(`❌ [DEBUG] All files failed to upload`);
        return response.data;
      } else {
        // Unexpected status code
        console.error(`⚠️ [DEBUG] Unexpected status code: ${response.statusCode}`);
        throw new Error(response.message || "Bulk upload failed");
      }
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`❌ [DEBUG] Bulk upload failed: Duration: ${duration}ms`);
      console.error(`❌ [DEBUG] Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        status: (error as { response?: { status?: number } }).response?.status,
        statusText: (error as { response?: { statusText?: string } }).response?.statusText,
        data: (error as { response?: { data?: unknown } }).response?.data,
      });
      throw error;
    }
  }
}

export const minioAPI = new MinioAPI();
