/**
 * Load i18n messages for email templates
 * This is a server-side utility to load messages from JSON files
 */

type Locale = 'en' | 'es' | 'pt';

interface EmailMessages {
  email_reset_subject: string;
  email_reset_greeting: string;
  email_reset_greeting_default: string;
  email_reset_body: string;
  email_reset_button: string;
  email_reset_expires: string;
  email_reset_ignore: string;
  email_reset_footer: string;
  email_reset_url_fallback: string;
  email_verify_subject: string;
  email_verify_body: string;
}

/**
 * Load email messages for a specific locale
 */
export async function loadEmailMessages(locale: Locale = 'en'): Promise<EmailMessages> {
  try {
    // Dynamically import the message file
    const messages = await import(`../../../../messages/${locale}.json`);
    return messages.default || messages;
  } catch (e) {
    console.warn(`Failed to load messages for locale ${locale}, falling back to en`);
    // Fallback to English
    if (locale !== 'en') {
      return loadEmailMessages('en');
    }
    // If even English fails, return defaults
    return getDefaultMessages();
  }
}

/**
 * Get default English messages (fallback)
 */
function getDefaultMessages(): EmailMessages {
  return {
    email_reset_subject: 'Reset Your Password',
    email_reset_greeting: 'Hi {name},',
    email_reset_greeting_default: 'Hi,',
    email_reset_body: 'We received a request to reset your password. Click the button below to create a new password:',
    email_reset_button: 'Reset Password',
    email_reset_expires: 'This link will expire in {hours} hour(s).',
    email_reset_ignore: "If you didn't request this, you can safely ignore this email.",
    email_reset_footer: 'If you have any questions, please contact our support team.',
    email_reset_url_fallback: 'Or copy and paste this URL into your browser:',
    email_verify_subject: 'Verify Your Email',
    email_verify_body: 'Please verify your email address to complete your registration.'
  };
}

/**
 * Convert email messages to reset password template format
 */
export function getResetPasswordMessages(messages: EmailMessages) {
  return {
    title: messages.email_reset_subject,
    greeting: messages.email_reset_greeting,
    greetingDefault: messages.email_reset_greeting_default,
    body: messages.email_reset_body,
    button: messages.email_reset_button,
    expires: messages.email_reset_expires,
    ignore: messages.email_reset_ignore,
    footer: messages.email_reset_footer,
    urlFallback: messages.email_reset_url_fallback
  };
}

