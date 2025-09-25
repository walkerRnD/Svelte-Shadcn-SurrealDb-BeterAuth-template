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

    // Forward Set-Cookie so the browser stores the session (support multiple cookies)
    const headersOut = new Headers({ 'content-type': 'application/json' });
    const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
    if (typeof getSetCookie === 'function') {
      const cookies: string[] = getSetCookie();
      for (const c of cookies) headersOut.append('set-cookie', c);
    } else {
      const c = res.headers.get('set-cookie');
      if (c) headersOut.set('set-cookie', c);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: headersOut });
  } catch (e: any) {
    return json({ error: e?.message || 'Dev login failed' }, { status: 400 });
  }
};

