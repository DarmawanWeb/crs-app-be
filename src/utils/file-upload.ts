import { unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";
import { v4 as uuidv4 } from "uuid";

export type UploadConfig = {
  maxSize?: number; // in bytes, default 10MB
  allowedExtensions?: string[];
  uploadDir?: string;
  generateFileName?: (originalName: string) => string;
};

export type UploadResult = {
  success: boolean;
  filePath?: string;
  fileName?: string;
  originalName?: string;
  size?: number;
  error?: string;
};

const DEFAULT_CONFIG: Required<UploadConfig> = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".png",
    ".jpg",
    ".jpeg",
  ],
  uploadDir: "uploads",
  generateFileName: (originalName: string) => {
    const ext = extname(originalName);
    return `${uuidv4()}${ext}`;
  },
};

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(uploadDir: string): Promise<void> {
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
}

/**
 * Validate file
 */
function validateFile(
  file: File,
  config: Required<UploadConfig>,
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file extension
  const ext = extname(file.name).toLowerCase();
  if (!config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type ${ext} is not allowed. Allowed types: ${config.allowedExtensions.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Upload single file
 *
 * @example
 * const result = await uploadFile(file, {
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedExtensions: ['.pdf', '.docx'],
 *   uploadDir: 'uploads/documents'
 * });
 */
export async function uploadFile(
  file: File,
  config: UploadConfig = {},
): Promise<UploadResult> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Validate file
    const validation = validateFile(file, finalConfig);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Ensure upload directory exists
    await ensureUploadDir(finalConfig.uploadDir);

    // Generate file name
    const fileName = finalConfig.generateFileName(file.name);
    const filePath = join(finalConfig.uploadDir, fileName);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await Bun.write(filePath, buffer);

    return {
      success: true,
      filePath,
      fileName,
      originalName: file.name,
      size: file.size,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  config: UploadConfig = {},
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadFile(file, config);
    results.push(result);
  }

  return results;
}

/**
 * Delete file from filesystem
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("File deletion error:", error);
    return false;
  }
}

/**
 * Document-specific upload configuration
 */
export const DOCUMENT_UPLOAD_CONFIG: UploadConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB for documents
  allowedExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
  uploadDir: "uploads/documents",
  generateFileName: (originalName: string) => {
    const ext = extname(originalName);
    const timestamp = Date.now();
    return `doc-${timestamp}-${uuidv4()}${ext}`;
  },
};

/**
 * Image-specific upload configuration
 */
export const IMAGE_UPLOAD_CONFIG: UploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB for images
  allowedExtensions: [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  uploadDir: "uploads/images",
  generateFileName: (originalName: string) => {
    const ext = extname(originalName);
    const timestamp = Date.now();
    return `img-${timestamp}-${uuidv4()}${ext}`;
  },
};

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return extname(filename).toLowerCase();
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}
