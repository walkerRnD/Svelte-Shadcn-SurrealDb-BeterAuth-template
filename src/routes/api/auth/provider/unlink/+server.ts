import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { AuthService } from '$lib/domain/auth/services/AuthService';
import { StringRecordId } from 'surrealdb';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const provider = String(body?.provider || '');
    // Guard: derive user from session
    const { getAuthUser } = await import('$lib/server/auth-helpers');
    const user = getAuthUser(locals);
    const service = new AuthService(getDb);
    const result = await service.unlinkProvider(new StringRecordId(user.id), provider);
    return json({ ok: true, providers: result.providers });
  } catch (e: any) {
    return json({ error: e?.message || 'Failed' }, { status: 400 });
  }
};

