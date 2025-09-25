import type { Surreal } from 'surrealdb';
import { StringRecordId } from 'surrealdb';
import type { UserPublic } from '../types/user';

export class UserService {
  constructor(private readonly getDb: () => Promise<Surreal>) {}

  async getProfile(ownerId: StringRecordId): Promise<UserPublic | null> {
    const db = await this.getDb();
    const [rows] = await db.query<[Array<any>]>(
      /* surql */ `SELECT id, name, email, created_at, updated_at FROM user WHERE id = $ownerId LIMIT 1`,
      { ownerId }
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: String(r.id),
      email: r.email,
      name: r.name ?? null,
      created_at: r.created_at ? new Date(r.created_at) : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at) : undefined,
    };
  }

  async updateName(ownerId: StringRecordId, name: string): Promise<UserPublic> {
    const db = await this.getDb();
    const [rows] = await db.query<[Array<any>]>(
      /* surql */ `UPDATE $ownerId SET name = $name RETURN AFTER`,
      { ownerId, name }
    );
    const r = rows?.[0] ?? {};
    return {
      id: String(r.id ?? ownerId),
      email: r.email,
      name: r.name ?? name,
      created_at: r.created_at ? new Date(r.created_at) : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at) : undefined,
    };
  }
}

