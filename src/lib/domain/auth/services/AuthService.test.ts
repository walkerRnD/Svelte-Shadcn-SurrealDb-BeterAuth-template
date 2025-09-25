import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Surreal, type Surreal as SurrealType, StringRecordId } from 'surrealdb';
import { AuthService } from './AuthService';

describe('AuthService (Jest, real SurrealDB memory)', () => {
  let db: SurrealType;
  const getDB = async () => db;
  const service = new AuthService(getDB);

  beforeAll(async () => {
    const { surrealdbNodeEngines } = await import('@surrealdb/node');
    db = new Surreal({ engines: surrealdbNodeEngines() }) as unknown as SurrealType;
    await db.connect('mem://test.db', { namespace: 'test', database: 'test' });
  });

  afterAll(async () => {
    await db.close();
  });

  it('ping returns ok and touches DB', async () => {
    const result = await service.ping();
    expect(result).toBe('ok');
    const [value] = await db.query('RETURN 1');
    expect(value).toBe(1);
  });

  it('requestPasswordReset validates email and returns ok', async () => {
    await expect(service.requestPasswordReset('dev+e2e@example.com')).resolves.toEqual({ ok: true });
    await expect(service.requestPasswordReset('bad-email')).rejects.toThrow('Invalid email');
  });

  it('link/unlink provider persists providers array', async () => {
    const userId = new StringRecordId('user:test-auth-1');
    // Ensure clean slate
    await service.unlinkProvider(userId, 'github');
    // Link adds provider
    const linked = await service.linkProvider(userId, 'github');
    expect(linked.ok).toBe(true);
    expect(linked.providers).toContain('github');

    // Verify in DB
    const [rows] = await db.query<any[]>(`SELECT providers FROM type::thing($table,$key) LIMIT 1`, {
      table: 'user',
      key: 'test-auth-1',
    });
    expect(Array.isArray(rows?.[0]?.providers)).toBe(true);
    expect(rows[0].providers).toContain('github');

    // Unlink removes provider
    const unlinked = await service.unlinkProvider(userId, 'github');
    expect(unlinked.providers).not.toContain('github');
  });
});

