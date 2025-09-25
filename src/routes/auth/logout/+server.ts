import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Server-side logout that forwards to Better Auth REST handler
// We reuse the mounted handler at /api/auth/sign-out so cookies are cleared properly
export const POST: RequestHandler = async ({ fetch, request, url }) => {
  const res = await fetch('/api/auth/sign-out', {
    method: 'POST',
    headers: {
      // Forward cookies and auth headers
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    }
  });

  // If Better Auth replied with new cookies, forward them
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    return new Response(null, {
      status: 303,
      headers: {
        location: '/',
        'set-cookie': setCookie
      }
    });
  }

  // Fallback redirect
  throw redirect(303, '/');
};

