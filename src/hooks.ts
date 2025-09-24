import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment'
import { getAuth } from './lib/server/infra/auth';


// Auth handler with session management and route protection
const authHandler: Handle = async ({ event, resolve }) => {
  const auth = getAuth();

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  // Make session and user available on server
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

// Paraglide handler
const handleParaglide: Handle = ({ event, resolve }) => paraglideMiddleware(event.request, ({ request, locale }) => {
  event.request = request;

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
  });
});

// Combine handlers using sequence - paraglide runs first to set locale, then auth
export const handle: Handle = sequence(handleParaglide, authHandler);
