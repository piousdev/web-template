import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  sendEmail,
  sendPasswordResetEmailTemplate,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email.service";

// Mock Resend
vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn(),
      },
    })),
  };
});

describe("Email Service", () => {
  let mockResendSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { Resend } = require("resend");
    const resendInstance = new Resend();
    mockResendSend = resendInstance.emails.send;
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
        text: "Test content",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("email-123");
      expect(mockResendSend).toHaveBeenCalledWith({
        from: "onboarding@resend.dev",
        to: ["test@example.com"],
        subject: "Test Email",
        html: "<p>Test content</p>",
        text: "Test content",
        replyTo: undefined,
        cc: undefined,
        bcc: undefined,
      });
    });

    it("should handle multiple recipients", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await sendEmail({
        to: ["test1@example.com", "test2@example.com"],
        subject: "Test Email",
        text: "Test content",
      });

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["test1@example.com", "test2@example.com"],
        }),
      );
    });

    it("should handle custom sender", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        text: "Test content",
        from: "custom@example.com",
      });

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "custom@example.com",
        }),
      );
    });

    it("should handle Resend API errors", async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: "API key invalid" },
      });

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        text: "Test content",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("API key invalid");
    });

    it("should handle unexpected errors", async () => {
      mockResendSend.mockRejectedValue(new Error("Network error"));

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        text: "Test content",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email with correct content", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await sendVerificationEmail(
        "user@example.com",
        "https://example.com/verify?token=abc123",
      );

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user@example.com"],
          subject: "Verify your email address",
        }),
      );

      const call = mockResendSend.mock.calls[0][0];
      expect(call.html).toContain("Verify your email address");
      expect(call.html).toContain("https://example.com/verify?token=abc123");
      expect(call.text).toContain("https://example.com/verify?token=abc123");
    });
  });

  describe("sendPasswordResetEmailTemplate", () => {
    it("should send password reset email with correct content", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await sendPasswordResetEmailTemplate(
        "user@example.com",
        "https://example.com/reset?token=xyz789",
      );

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user@example.com"],
          subject: "Reset your password",
        }),
      );

      const call = mockResendSend.mock.calls[0][0];
      expect(call.html).toContain("Reset your password");
      expect(call.html).toContain("https://example.com/reset?token=xyz789");
      expect(call.text).toContain("https://example.com/reset?token=xyz789");
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email with correct content", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await sendWelcomeEmail("user@example.com", "John Doe");

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user@example.com"],
          subject: "Welcome aboard!",
        }),
      );

      const call = mockResendSend.mock.calls[0][0];
      expect(call.html).toContain("Welcome, John Doe!");
      expect(call.text).toContain("Welcome, John Doe!");
    });
  });
});
