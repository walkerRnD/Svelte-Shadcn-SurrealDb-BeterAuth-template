import type { App } from '@sveltejs/kit';

export function getAuthUser(locals: App.Locals) {
  if (locals?.user) return locals.user;
  throw Object.assign(new Error('Unauthorized'), { status: 401 });
}

export function getAuthSession(locals: App.Locals) {
  if (locals?.session) return locals.session;
  throw Object.assign(new Error('Unauthorized'), { status: 401 });
}

