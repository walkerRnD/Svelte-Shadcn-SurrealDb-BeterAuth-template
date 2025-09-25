import type { Surreal } from 'surrealdb';
import { StringRecordId } from 'surrealdb';
import type { UserPublic } from '../types/user';

export class UserService {
  constructor(private readonly getDb: () => Promise<Surreal>) { }

  async getProfile(ownerId: StringRecordId): Promise<UserPublic | null> {
    const db = await this.getDb();
    const rid = String(ownerId);
    const sep = rid.indexOf(':');
    const table = sep > 0 ? rid.slice(0, sep) : 'user';
    const key = sep > 0 ? rid.slice(sep + 1) : rid;
    const [rows] = await db.query<[Array<any>]>(
      /* surql */ `SELECT id, name, email, created_at, updated_at
        FROM type::thing($table, $key) LIMIT 1`,
      { table, key }
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
    const rid = String(ownerId);
    const sep = rid.indexOf(':');
    const table = sep > 0 ? rid.slice(0, sep) : 'user';
    const key = sep > 0 ? rid.slice(sep + 1) : rid;
    const [rows] = await db.query<[Array<any>]>(
      /* surql */ `UPDATE type::thing($table, $key) SET name = $name RETURN AFTER`,
      { table, key, name }
    );
    const r = rows?.[0] ?? {};
    return {
      id: String(r.id ?? rid),
      email: r.email,
      name: r.name ?? name,
      created_at: r.created_at ? new Date(r.created_at) : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at) : undefined,
    };
  }
}

