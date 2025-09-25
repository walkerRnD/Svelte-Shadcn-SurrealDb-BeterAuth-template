import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { AuthService } from '$lib/domain/auth/services/AuthService';
import { StringRecordId } from 'surrealdb';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = String(body?.userId || '');
    const provider = String(body?.provider || '');
    const service = new AuthService(getDb);
    const result = await service.linkProvider(new StringRecordId(userId), provider);
    return json({ ok: true, providers: result.providers });
  } catch (e: any) {
    return json({ error: e?.message || 'Failed' }, { status: 400 });
  }
};

