import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

// Dev-only login helper used by E2E: attempts sign-in, otherwise sign-up then sign-in.
// It proxies to Better Auth endpoints and forwards Set-Cookie so the browser session is established.
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || 'dev+e2e@example.com');
    const password = String(body?.password || 'password1234');
    const name = String(body?.name || 'Dev User');

    // 1) Try sign-in
    let res = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // 2) If sign-in failed, try sign-up then sign-in again
      const signup = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!signup.ok) {
        const text = await signup.text().catch(() => 'signup failed');
        return json({ error: text }, { status: 400 });
      }
      res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => 'sign-in failed');
      return json({ error: text }, { status: 401 });
    }

    // Return the upstream response directly so multiple Set-Cookie headers are preserved
    return new Response(res.body, { status: res.status, headers: res.headers });
  } catch (e: any) {
    return json({ error: e?.message || 'Dev login failed' }, { status: 400 });
  }
};

