import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { AuthService } from '$lib/domain/auth/services/AuthService';
import { StringRecordId } from 'surrealdb';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { getAuthUser } = await import('$lib/server/auth-helpers');
    const user = getAuthUser(locals);
    const service = new AuthService(getDb);
    const providers = await service.getProviders(new StringRecordId(user.id));
    return json({ ok: true, providers });
  } catch (e: any) {
    return json({ error: e?.message || 'Failed' }, { status: 401 });
  }
};

