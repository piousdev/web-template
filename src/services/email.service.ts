import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  try {
    // Build email options - Resend requires at least html OR text
    const emailOptions: {
      from: string;
      to: string[];
      subject: string;
      html?: string;
      text?: string;
      replyTo?: string;
      cc?: string | string[];
      bcc?: string | string[];
    } = {
      from: options.from || "onboarding@resend.dev", // Default sender - update with your verified domain
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html || undefined,
      text: options.text || undefined,
    };

    // Only add optional fields if they are provided
    if (options.replyTo) emailOptions.replyTo = options.replyTo;
    if (options.cc) emailOptions.cc = options.cc;
    if (options.bcc) emailOptions.bcc = options.bcc;

    const { data, error } = await resend.emails.send(
      emailOptions as Parameters<typeof resend.emails.send>[0],
    );

    if (error) {
      console.error("[Email Service] Error sending email:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (error) {
    console.error("[Email Service] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
          <p>Click the button below to verify your email address and activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      </body>
    </html>
  `;

  const text = `Verify your email address\n\nClick the link below to verify your email address:\n${verificationUrl}\n\nIf you didn't request this email, you can safely ignore it.\nThis link will expire in 24 hours.`;

  return sendEmail({
    to,
    subject: "Verify your email address",
    html,
    text,
  });
}

/**
 * Send password reset email template
 * Note: Use authService.sendPasswordResetEmail for Better Auth integration
 */
export async function sendPasswordResetEmailTemplate(
  to: string,
  resetUrl: string,
): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
          <p>Click the button below to reset your password.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
      </body>
    </html>
  `;

  const text = `Reset your password\n\nClick the link below to reset your password:\n${resetUrl}\n\nIf you didn't request this email, you can safely ignore it.\nThis link will expire in 1 hour.`;

  return sendEmail({
    to,
    subject: "Reset your password",
    html,
    text,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
          <p>Thanks for joining us. We're excited to have you on board.</p>
          <p>Get started by exploring your dashboard and setting up your account.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.BETTER_AUTH_URL}/dashboard" style="background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">Go to Dashboard</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
      </body>
    </html>
  `;

  const text = `Welcome, ${name}!\n\nThanks for joining us. We're excited to have you on board.\n\nGet started by visiting: ${process.env.BETTER_AUTH_URL}/dashboard\n\nIf you have any questions, feel free to reach out to our support team.`;

  return sendEmail({
    to,
    subject: "Welcome aboard!",
    html,
    text,
  });
}

export const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmailTemplate,
  sendWelcomeEmail,
};
