import { describe, it, expect } from '@jest/globals';
import { resetPasswordEmailTemplate } from '../reset-password.html';

describe('resetPasswordEmailTemplate', () => {
  it('should generate HTML email with default messages', () => {
    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Reset Your Password');
    expect(html).toContain('http://localhost:5173/auth/reset-password?token=abc123');
    expect(html).toContain('Hi,');
  });

  it('should include user name when provided', () => {
    const html = resetPasswordEmailTemplate({
      userName: 'John Doe',
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
    });

    expect(html).toContain('Hi John Doe,');
    expect(html).not.toContain('Hi,');
  });

  it('should show correct expiration time', () => {
    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
      expiresInHours: 2,
    });

    expect(html).toContain('2 hour(s)');
  });

  it('should use custom messages when provided', () => {
    const customMessages = {
      title: 'Redefinir Senha',
      greeting: 'Olá {name},',
      greetingDefault: 'Olá,',
      body: 'Recebemos uma solicitação para redefinir sua senha.',
      button: 'Redefinir Senha',
      expires: 'Este link expirará em {hours} hora(s).',
      ignore: 'Se você não solicitou isso, ignore este e-mail.',
      footer: 'Entre em contato com o suporte.',
      urlFallback: 'Ou copie e cole esta URL:'
    };

    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
      messages: customMessages,
    });

    expect(html).toContain('Redefinir Senha');
    expect(html).toContain('Olá,');
    expect(html).toContain('Recebemos uma solicitação');
  });

  it('should escape HTML in user name', () => {
    const html = resetPasswordEmailTemplate({
      userName: '<script>alert("xss")</script>',
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should escape HTML in reset URL', () => {
    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123&foo=<script>',
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should include both button and fallback URL', () => {
    const resetUrl = 'http://localhost:5173/auth/reset-password?token=abc123';
    const html = resetPasswordEmailTemplate({ resetUrl });

    // Should have button with href
    expect(html).toContain('class="button"');
    expect(html).toContain(`href="${resetUrl}"`);
    
    // Should have fallback URL section
    expect(html).toContain('url-fallback');
  });

  it('should include footer text', () => {
    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
    });

    expect(html).toContain('If you have any questions');
    expect(html).toContain('support team');
  });

  it('should be valid HTML structure', () => {
    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
    });

    // Check for essential HTML structure
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });

  it('should include email-safe CSS', () => {
    const html = resetPasswordEmailTemplate({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc123',
    });

    expect(html).toContain('<style>');
    expect(html).toContain('font-family');
    expect(html).toContain('background-color');
  });
});

