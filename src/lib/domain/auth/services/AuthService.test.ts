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

  it('link/unlink provider stubs return ok', async () => {
    const userId = new StringRecordId('user:test-auth-1');
    await expect(service.linkProvider(userId, 'github')).resolves.toEqual({ ok: true });
    await expect(service.unlinkProvider(userId, 'github')).resolves.toEqual({ ok: true });
  });
});

