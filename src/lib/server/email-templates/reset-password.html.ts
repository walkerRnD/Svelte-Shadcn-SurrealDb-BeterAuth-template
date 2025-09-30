import { baseEmailTemplate } from './base.html';

export interface ResetPasswordEmailProps {
  userName?: string;
  resetUrl: string;
  expiresInHours?: number;
  locale?: string;
  messages?: {
    title: string;
    greeting: string;
    greetingDefault: string;
    body: string;
    button: string;
    expires: string;
    ignore: string;
    footer: string;
    urlFallback: string;
  };
}

/**
 * Default English messages for password reset email
 */
const defaultMessages = {
  title: 'Reset Your Password',
  greeting: 'Hi {name},',
  greetingDefault: 'Hi,',
  body: 'We received a request to reset your password. Click the button below to create a new password:',
  button: 'Reset Password',
  expires: 'This link will expire in {hours} hour(s).',
  ignore: "If you didn't request this, you can safely ignore this email.",
  footer: 'If you have any questions, please contact our support team.',
  urlFallback: 'Or copy and paste this URL into your browser:'
};

/**
 * Generate HTML email template for password reset
 */
export function resetPasswordEmailTemplate(props: ResetPasswordEmailProps): string {
  const {
    userName,
    resetUrl,
    expiresInHours = 1,
    messages = defaultMessages
  } = props;

  // Use provided messages or defaults
  const msg = { ...defaultMessages, ...messages };

  // Replace placeholders
  const greeting = userName
    ? msg.greeting.replace('{name}', escapeHtml(userName))
    : msg.greetingDefault;

  const expiresText = msg.expires.replace('{hours}', String(expiresInHours));

  const content = `
    <h1>${escapeHtml(msg.title)}</h1>
    <p>${greeting}</p>
    <p>${escapeHtml(msg.body)}</p>
    <div class="button-container">
      <a href="${escapeHtml(resetUrl)}" class="button">${escapeHtml(msg.button)}</a>
    </div>
    <p>${escapeHtml(expiresText)}</p>
    <p>${escapeHtml(msg.ignore)}</p>
    <div class="url-fallback">
      <p style="margin: 0 0 8px 0; font-weight: 500;">${escapeHtml(msg.urlFallback)}</p>
      <a href="${escapeHtml(resetUrl)}" style="color: #666;">${escapeHtml(resetUrl)}</a>
    </div>
  `;

  return baseEmailTemplate({
    title: msg.title,
    preheader: msg.body,
    content,
    footerText: msg.footer
  });
}

/**
 * Escape HTML to prevent XSS in email templates
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

