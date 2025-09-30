import { Resend } from 'resend';
import { resetPasswordEmailTemplate, type ResetPasswordEmailProps } from '../email-templates/reset-password.html';

// 📌 Get configuration from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_NAME = process.env.APP_NAME || 'Pic Flow';

if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not set. Email sending will fail.');
}

// 📌 Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResult {
  id?: string;
  error?: string;
}

/**
 * Email service for sending transactional emails using Resend
 */
export class EmailService {
  /**
   * Send a generic email
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      if (!RESEND_API_KEY || !resend) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      const { data, error } = await resend.emails.send({
        from: options.from || `${APP_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error('❌ Email send error:', error);
        return { error: error.message || 'Failed to send email' };
      }

      console.log('✅ Email sent:', data?.id);
      return { id: data?.id || 'unknown' };
    } catch (e: any) {
      console.error('❌ Email service error:', e);
      return { error: e?.message || 'Failed to send email' };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    to: string,
    props: ResetPasswordEmailProps
  ): Promise<EmailResult> {
    const html = resetPasswordEmailTemplate(props);

    // Use custom subject if provided in messages, otherwise use default
    const subject = props.messages?.title || 'Reset Your Password';

    return this.send({
      to,
      subject,
      html,
    });
  }

  /**
   * Send email verification (for future use)
   */
  async sendEmailVerification(
    to: string,
    verificationUrl: string,
    options?: {
      userName?: string;
      locale?: string;
    }
  ): Promise<EmailResult> {
    // TODO: Implement proper email verification template when needed
    const userName = options?.userName || '';
    const greeting = userName ? `Hi ${userName},` : 'Hi,';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1>Verify Your Email</h1>
            <p>${greeting}</p>
            <p>Please verify your email address to complete your registration.</p>
            <p style="margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #000; color: #fff; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this URL into your browser:<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Verify Your Email',
      html,
    });
  }
}

// 📌 Export singleton instance
export const emailService = new EmailService();

