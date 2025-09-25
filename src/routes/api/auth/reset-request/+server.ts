import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '');
    // Forward directly to Better Auth's forgot-password endpoint
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      return json({ error: await res.text().catch(() => 'Failed') }, { status: 400 });
    }
    const data = await res.json().catch(() => ({}));
    return json(data?.data ?? { ok: true });
  } catch (e: any) {
    return json({ error: e?.message || 'Failed' }, { status: 400 });
  }
};

