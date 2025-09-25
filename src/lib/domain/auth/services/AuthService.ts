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

  // Link an OAuth provider for a user by storing it in a simple providers array
  async linkProvider(userId: StringRecordId, provider: string): Promise<{ ok: true; providers: string[] }> {
    if (!provider) throw new Error('provider is required');
    const db = await this.getDb();
    const rid = String(userId);
    const sep = rid.indexOf(':');
    const table = sep > 0 ? rid.slice(0, sep) : 'user';
    const key = sep > 0 ? rid.slice(sep + 1) : rid;

    const [rows] = await db.query<any[]>(
      /* surql */ `SELECT providers FROM type::thing($table, $key) LIMIT 1`,
      { table, key }
    );
    const first = Array.isArray(rows) && rows.length ? rows[0] : undefined;
    if (!first) {
      // ensure record exists so UPDATE succeeds on memory engine
      await db.query(
        /* surql */ `CREATE type::thing($table, $key) CONTENT { providers: [] }`,
        { table, key }
      );
    }
    const existing: string[] = Array.isArray(first?.providers) ? (first.providers as string[]) : [];
    const providers = Array.from(new Set([...(existing || []), provider]));

    await db.query(
      /* surql */ `UPDATE type::thing($table, $key) SET providers = $providers RETURN AFTER`,
      { table, key, providers }
    );
    return { ok: true, providers };
  }

  async unlinkProvider(userId: StringRecordId, provider: string): Promise<{ ok: true; providers: string[] }> {
    if (!provider) throw new Error('provider is required');
    const db = await this.getDb();
    const rid = String(userId);
    const sep = rid.indexOf(':');
    const table = sep > 0 ? rid.slice(0, sep) : 'user';
    const key = sep > 0 ? rid.slice(sep + 1) : rid;

    const [rows] = await db.query<any[]>(
      /* surql */ `SELECT providers FROM type::thing($table, $key) LIMIT 1`,
      { table, key }
    );
    const first = Array.isArray(rows) && rows.length ? rows[0] : undefined;
    if (!first) {
      await db.query(
        /* surql */ `CREATE type::thing($table, $key) CONTENT { providers: [] }`,
        { table, key }
      );
    }
    const existing: string[] = Array.isArray(first?.providers) ? (first.providers as string[]) : [];
    const providers = (existing || []).filter((p: string) => p !== provider);

    await db.query(
      /* surql */ `UPDATE type::thing($table, $key) SET providers = $providers RETURN AFTER`,
      { table, key, providers }
    );
    return { ok: true, providers };
  }

  async getProviders(userId: StringRecordId): Promise<string[]> {
    const db = await this.getDb();
    const rid = String(userId);
    const sep = rid.indexOf(':');
    const table = sep > 0 ? rid.slice(0, sep) : 'user';
    const key = sep > 0 ? rid.slice(sep + 1) : rid;
    const [rows] = await db.query<any[]>(
      /* surql */ `SELECT providers FROM type::thing($table, $key) LIMIT 1`,
      { table, key }
    );
    const first = Array.isArray(rows) && rows.length ? rows[0] : undefined;
    const existing: string[] = Array.isArray(first?.providers) ? (first.providers as string[]) : [];
    return existing;
  }
}
