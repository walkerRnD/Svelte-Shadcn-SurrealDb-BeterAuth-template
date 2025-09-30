export interface BaseEmailProps {
  title: string;
  preheader?: string;
  content: string;
  footerText?: string;
  brandName?: string;
}

export function baseEmailTemplate(props: BaseEmailProps): string {
  const { title, preheader, content, footerText, brandName = 'Pic Flow' } = props;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${preheader ? `<meta name="description" content="${escapeHtml(preheader)}">` : ''}
  <style>
    /* Email-safe CSS - inline styles for maximum compatibility */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f4f4f4;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #000000;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-body h1 {
      color: #000000;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .email-body p {
      margin: 0 0 16px 0;
      color: #333333;
    }
    .button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #333333;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      background-color: #f9f9f9;
      color: #666666;
      font-size: 12px;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #eeeeee;
    }
    .footer p {
      margin: 5px 0;
    }
    .url-fallback {
      color: #666666;
      font-size: 14px;
      word-break: break-all;
      margin-top: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    .url-fallback a {
      color: #666666;
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .email-body {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>${escapeHtml(brandName)}</h1>
      </div>
      <div class="email-body">
        ${content}
      </div>
      ${footerText ? `
      <div class="footer">
        <p>${escapeHtml(footerText)}</p>
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(brandName)}. All rights reserved.</p>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `.trim();
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

