import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Surreal, StringRecordId, type Surreal as SurrealType } from 'surrealdb';
import { UserService } from './UserService';

describe('UserService (Jest, real SurrealDB memory)', () => {
  let db: SurrealType;
  const getDB = async () => db;
  const ownerId = new StringRecordId('user:test-jest-1');
  const service = new UserService(getDB);

  beforeAll(async () => {
    const { surrealdbNodeEngines } = await import('@surrealdb/node');
    db = new Surreal({ engines: surrealdbNodeEngines() }) as unknown as SurrealType;
    await db.connect('mem://test.db', { namespace: 'test', database: 'test' });
    // seed a user record
    await db.query(/* surql */ `CREATE type::thing('user', 'test-jest-1') SET email = $email, name = $name`, {
      email: 'jestuser@example.com',
      name: 'Jest User',
    });
  });

  afterAll(async () => {
    await db.close();
  });

  it('getProfile returns the seeded user', async () => {
    const profile = await service.getProfile(ownerId);
    expect(profile).not.toBeNull();
    expect(profile?.email).toBe('jestuser@example.com');
    expect(profile?.name).toBe('Jest User');
  });

  it('updateName updates the user name and returns AFTER', async () => {
    const updated = await service.updateName(ownerId, 'Updated Name');
    expect(updated.name).toBe('Updated Name');

    const profileAgain = await service.getProfile(ownerId);
    expect(profileAgain?.name).toBe('Updated Name');
  });

  it('getProfile returns null for missing user', async () => {
    const missing = await service.getProfile(new StringRecordId('user:does-not-exist'));
    expect(missing).toBeNull();
  });
});

