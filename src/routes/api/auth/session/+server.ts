import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getAuthForRequest } from '$lib/server/infra/auth';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const auth = getAuthForRequest(request);
    const session = await auth.api.getSession({ headers: request.headers });
    return json({ user: session?.user || null });
  } catch (e: any) {
    return json({ error: e?.message || 'Failed to get session' }, { status: 400 });
  }
};

