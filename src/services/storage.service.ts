import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || "";
const CDN_URL = process.env.CLOUDFLARE_CDN_URL || "";

export interface UploadFileOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  url: string;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadFile(
  options: UploadFileOptions,
): Promise<UploadResult> {
  try {
    const params: PutObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType || "application/octet-stream",
      Metadata: options.metadata,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const url = CDN_URL
      ? `${CDN_URL}/${options.key}`
      : getPublicUrl(options.key);

    return {
      success: true,
      key: options.key,
      url,
    };
  } catch (error) {
    console.error("[Storage Service] Error uploading file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Download a file from Cloudflare R2
 */
export async function downloadFile(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return null;
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("[Storage Service] Error downloading file:", error);
    return null;
  }
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("[Storage Service] Error deleting file:", error);
    return false;
  }
}

/**
 * List files in a prefix (folder)
 */
export async function listFiles(
  prefix?: string,
  maxKeys = 100,
): Promise<FileInfo[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
      url: CDN_URL ? `${CDN_URL}/${item.Key}` : getPublicUrl(item.Key || ""),
    }));
  } catch (error) {
    console.error("[Storage Service] Error listing files:", error);
    return [];
  }
}

/**
 * Generate a presigned URL for temporary file access
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("[Storage Service] Error generating presigned URL:", error);
    return null;
  }
}

/**
 * Generate a presigned URL for uploading a file
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string | null> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error(
      "[Storage Service] Error generating presigned upload URL:",
      error,
    );
    return null;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Get public URL for a file (when using public bucket or CDN)
 */
function getPublicUrl(key: string): string {
  return `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;
}

/**
 * Upload file with automatic content type detection
 */
export async function uploadFileAuto(
  key: string,
  body: Buffer | Uint8Array | string,
  metadata?: Record<string, string>,
): Promise<UploadResult> {
  const contentType = getContentTypeFromExtension(key);
  return uploadFile({ key, body, contentType, metadata });
}

/**
 * Simple content type detection based on file extension
 */
function getContentTypeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  const contentTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Text
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    // Video
    mp4: "video/mp4",
    webm: "video/webm",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
  };

  return contentTypes[ext || ""] || "application/octet-stream";
}

export const storageService = {
  uploadFile,
  uploadFileAuto,
  downloadFile,
  deleteFile,
  listFiles,
  fileExists,
  getPresignedUrl,
  getPresignedUploadUrl,
  getPublicUrl,
};
