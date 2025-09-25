import type { RequestHandler } from '@sveltejs/kit';


// Server-side logout that uses Better Auth server API (avoids CSRF issues)
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { getAuth } = await import('$lib/server/infra/auth');
    const auth = getAuth();
    // Try server-side signOut if available
    const api: any = auth.api as any;
    if (api?.signOut) {
      const res: Response = await api.signOut({ headers: request.headers });
      // Forward any Set-Cookie headers to clear cookies in the browser
      const headersOut = new Headers();
      // @ts-expect-error: non-standard getSetCookie accessor in SvelteKit Headers
      const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
      if (typeof getSetCookie === 'function') {
        const cookies: string[] = getSetCookie();
        for (const c of cookies) headersOut.append('set-cookie', c);
      } else {
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) headersOut.set('set-cookie', setCookie);
      }
      headersOut.set('location', '/');
      return new Response(null, { status: 303, headers: headersOut });
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: aggressively clear cookies on server side to ensure logout works in preview/test
  const headersOut = new Headers({ location: '/' });
  const prefix = 'better-auth';
  const cookieBase = (name: string) => `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
  const cookies = [
    cookieBase(`${prefix}.session_token`),
    cookieBase(`${prefix}.session_data`),
    cookieBase(`${prefix}.dont_remember`),
  ];
  for (const c of cookies) headersOut.append('set-cookie', c);
  return new Response(null, { status: 303, headers: headersOut });
};

