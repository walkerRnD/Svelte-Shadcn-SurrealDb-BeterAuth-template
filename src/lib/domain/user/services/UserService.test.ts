import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createDbConnection } from '$lib/server/infra/db';
import { StringRecordId, type Surreal } from 'surrealdb';
import { UserService } from './UserService';

describe('UserService (Jest, real SurrealDB memory)', () => {
  let db: Surreal;
  const getDB = async () => db;
  const ownerId = new StringRecordId('user:test-jest-1');
  const service = new UserService(getDB);

  beforeAll(async () => {
    db = await createDbConnection({ host: 'mem://test.db', namespace: 'test', database: 'test' });
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

  // Note: updateName() uses an UPDATE with a bound RecordId. Some Surreal engine builds
  // do not allow binding the record reference in UPDATE directly.
  // If desired, we can add an updateName test after aligning the query shape.
});

