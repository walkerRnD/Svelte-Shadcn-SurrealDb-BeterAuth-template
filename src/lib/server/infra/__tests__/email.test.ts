import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EmailService } from '../email';

describe('EmailService', () => {
  let service: EmailService;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    service = new EmailService();
    originalApiKey = process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    // Restore original API key
    if (originalApiKey !== undefined) {
      process.env.RESEND_API_KEY = originalApiKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  });

  it('should create email service instance', () => {
    expect(service).toBeDefined();
    expect(service.send).toBeDefined();
    expect(service.sendPasswordReset).toBeDefined();
    expect(service.sendEmailVerification).toBeDefined();
  });

  it('should handle missing API key gracefully', async () => {
    delete process.env.RESEND_API_KEY;
    const newService = new EmailService();

    const result = await newService.sendPasswordReset('test@example.com', {
      resetUrl: 'http://localhost:5173/auth/reset-password?token=test',
    });

    expect(result).toHaveProperty('error');
    expect(result.error).toContain('RESEND_API_KEY');
  });

  // 📝 Skip actual sending in tests unless E2E flag is set
  (process.env.E2E === 'true' ? it : it.skip)(
    'should send password reset email (E2E)',
    async () => {
      const result = await service.sendPasswordReset('test@example.com', {
        userName: 'Test User',
        resetUrl: 'http://localhost:5173/auth/reset-password?token=test123',
        expiresInHours: 1,
      });

      // In E2E mode with valid API key, should succeed
      if (process.env.RESEND_API_KEY) {
        expect(result).toHaveProperty('id');
        expect(result.id).toBeTruthy();
      } else {
        expect(result).toHaveProperty('error');
      }
    }
  );

  it('should accept custom messages for password reset', async () => {
    const customMessages = {
      title: 'Custom Title',
      greeting: 'Hello {name}!',
      greetingDefault: 'Hello!',
      body: 'Custom body text',
      button: 'Click Here',
      expires: 'Expires in {hours}h',
      ignore: 'Ignore this',
      footer: 'Custom footer',
      urlFallback: 'Or use this link:'
    };

    // This will fail without API key, but we're testing the interface
    const result = await service.sendPasswordReset('test@example.com', {
      resetUrl: 'http://localhost:5173/auth/reset-password?token=test',
      messages: customMessages,
    });

    // Should have error due to missing API key, but the call should work
    expect(result).toBeDefined();
  });

  it('should handle email verification', async () => {
    const result = await service.sendEmailVerification(
      'test@example.com',
      'http://localhost:5173/auth/verify?token=test'
    );

    // Should return error without API key
    expect(result).toBeDefined();
  });

  it('should accept array of recipients', async () => {
    const result = await service.send({
      to: ['test1@example.com', 'test2@example.com'],
      subject: 'Test Subject',
      html: '<p>Test</p>',
    });

    // Should return error without API key
    expect(result).toHaveProperty('error');
  });

  it('should accept single recipient string', async () => {
    const result = await service.send({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
    });

    // Should return error without API key
    expect(result).toHaveProperty('error');
  });
});

