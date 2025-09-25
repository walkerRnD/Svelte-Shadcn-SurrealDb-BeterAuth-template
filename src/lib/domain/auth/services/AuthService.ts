import type { Surreal } from 'surrealdb';
import { StringRecordId } from 'surrealdb';

// Backend helpers for auth-related flows (kept minimal; Better Auth handles core routes)
export class AuthService {
  constructor(private readonly getDb: () => Promise<Surreal>) { }

  // Health check to validate DI and DB availability
  async ping(): Promise<'ok'> {
    await this.getDb();
    return 'ok';
  }

  // Request a password reset token (delegated to Better Auth route in app; here we just stub flow)
  async requestPasswordReset(email: string): Promise<{ ok: true }> {
    if (!email || !email.includes('@')) throw new Error('Invalid email');
    // In a real implementation you would call the server route /api/auth/reset-password
    // or a Better Auth server function to trigger sendResetPassword.
    await this.getDb();
    return { ok: true };
  }

  // Link an OAuth provider for a user (placeholder to keep DI and typing consistent)
  async linkProvider(userId: StringRecordId, provider: string): Promise<{ ok: true }> {
    if (!provider) throw new Error('provider is required');
    const db = await this.getDb();
    // Example: store a marker field (no-op here to avoid schema drift)
    await db.query('RETURN true');
    return { ok: true };
  }

  async unlinkProvider(userId: StringRecordId, provider: string): Promise<{ ok: true }> {
    if (!provider) throw new Error('provider is required');
    const db = await this.getDb();
    await db.query('RETURN true');
    return { ok: true };
  }
}
