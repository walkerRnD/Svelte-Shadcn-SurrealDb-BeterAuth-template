import type { RequestEvent } from '@sveltejs/kit';

export function getAuthUser(locals: RequestEvent['locals']) {
  if (locals?.user) return locals.user;
  throw Object.assign(new Error('Unauthorized'), { status: 401 });
}

export function getAuthSession(locals: RequestEvent['locals']) {
  if (locals?.session) return locals.session;
  throw Object.assign(new Error('Unauthorized'), { status: 401 });
}

