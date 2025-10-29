import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteFile,
  downloadFile,
  fileExists,
  getPresignedUploadUrl,
  getPresignedUrl,
  listFiles,
  uploadFile,
  uploadFileAuto,
} from "./storage.service";

// Mock AWS SDK
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: vi.fn(),
    })),
    PutObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
    DeleteObjectCommand: vi.fn(),
    ListObjectsV2Command: vi.fn(),
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("Storage Service", () => {
  let mockS3Send: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { S3Client } = require("@aws-sdk/client-s3");
    const s3Instance = new S3Client();
    mockS3Send = s3Instance.send;
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      mockS3Send.mockResolvedValue({});

      const result = await uploadFile({
        key: "test/file.txt",
        body: Buffer.from("test content"),
        contentType: "text/plain",
      });

      expect(result.success).toBe(true);
      expect(result.key).toBe("test/file.txt");
      expect(result.url).toBeDefined();
    });

    it("should upload file with metadata", async () => {
      mockS3Send.mockResolvedValue({});

      const result = await uploadFile({
        key: "test/file.txt",
        body: Buffer.from("test content"),
        contentType: "text/plain",
        metadata: { userId: "user-123" },
      });

      expect(result.success).toBe(true);
    });

    it("should handle upload errors", async () => {
      mockS3Send.mockRejectedValue(new Error("Upload failed"));

      const result = await uploadFile({
        key: "test/file.txt",
        body: Buffer.from("test content"),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Upload failed");
    });
  });

  describe("uploadFileAuto", () => {
    it("should upload file with auto-detected content type", async () => {
      mockS3Send.mockResolvedValue({});

      const result = await uploadFileAuto(
        "test/image.png",
        Buffer.from("image data"),
      );

      expect(result.success).toBe(true);
      expect(result.key).toBe("test/image.png");
    });

    it("should detect various file types", async () => {
      mockS3Send.mockResolvedValue({});

      const testCases = [
        { filename: "doc.pdf", body: Buffer.from("pdf") },
        { filename: "image.jpg", body: Buffer.from("jpg") },
        { filename: "data.json", body: Buffer.from("{}") },
      ];

      for (const testCase of testCases) {
        const result = await uploadFileAuto(testCase.filename, testCase.body);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("downloadFile", () => {
    it("should download file successfully", async () => {
      const mockBody = {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("test content");
        },
      };

      mockS3Send.mockResolvedValue({
        Body: mockBody,
      });

      const result = await downloadFile("test/file.txt");

      expect(result).toBeInstanceOf(Buffer);
      expect(result?.toString()).toBe("test content");
    });

    it("should return null if file has no body", async () => {
      mockS3Send.mockResolvedValue({
        Body: null,
      });

      const result = await downloadFile("test/file.txt");

      expect(result).toBeNull();
    });

    it("should handle download errors", async () => {
      mockS3Send.mockRejectedValue(new Error("Download failed"));

      const result = await downloadFile("test/file.txt");

      expect(result).toBeNull();
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      mockS3Send.mockResolvedValue({});

      const result = await deleteFile("test/file.txt");

      expect(result).toBe(true);
    });

    it("should handle delete errors", async () => {
      mockS3Send.mockRejectedValue(new Error("Delete failed"));

      const result = await deleteFile("test/file.txt");

      expect(result).toBe(false);
    });
  });

  describe("listFiles", () => {
    it("should list files successfully", async () => {
      mockS3Send.mockResolvedValue({
        Contents: [
          {
            Key: "test/file1.txt",
            Size: 100,
            LastModified: new Date("2025-01-01"),
          },
          {
            Key: "test/file2.txt",
            Size: 200,
            LastModified: new Date("2025-01-02"),
          },
        ],
      });

      const result = await listFiles("test/");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        key: "test/file1.txt",
        size: 100,
        lastModified: new Date("2025-01-01"),
        url: expect.any(String),
      });
    });

    it("should return empty array if no contents", async () => {
      mockS3Send.mockResolvedValue({
        Contents: null,
      });

      const result = await listFiles("test/");

      expect(result).toEqual([]);
    });

    it("should handle list errors", async () => {
      mockS3Send.mockRejectedValue(new Error("List failed"));

      const result = await listFiles("test/");

      expect(result).toEqual([]);
    });
  });

  describe("fileExists", () => {
    it("should return true if file exists", async () => {
      mockS3Send.mockResolvedValue({});

      const result = await fileExists("test/file.txt");

      expect(result).toBe(true);
    });

    it("should return false if file does not exist", async () => {
      mockS3Send.mockRejectedValue(new Error("Not found"));

      const result = await fileExists("test/nonexistent.txt");

      expect(result).toBe(false);
    });
  });

  describe("getPresignedUrl", () => {
    it("should generate presigned URL successfully", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
      getSignedUrl.mockResolvedValue("https://presigned-url.com/file");

      const result = await getPresignedUrl("test/file.txt", 3600);

      expect(result).toBe("https://presigned-url.com/file");
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 3600 },
      );
    });

    it("should handle presigned URL errors", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
      getSignedUrl.mockRejectedValue(new Error("Signing failed"));

      const result = await getPresignedUrl("test/file.txt");

      expect(result).toBeNull();
    });
  });

  describe("getPresignedUploadUrl", () => {
    it("should generate presigned upload URL successfully", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
      getSignedUrl.mockResolvedValue("https://presigned-upload-url.com/file");

      const result = await getPresignedUploadUrl(
        "test/file.txt",
        "text/plain",
        1800,
      );

      expect(result).toBe("https://presigned-upload-url.com/file");
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 1800 },
      );
    });

    it("should handle presigned upload URL errors", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
      getSignedUrl.mockRejectedValue(new Error("Signing failed"));

      const result = await getPresignedUploadUrl("test/file.txt", "text/plain");

      expect(result).toBeNull();
    });
  });
});
