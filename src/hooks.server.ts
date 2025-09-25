// Ensure environment variables from .env and .env.<NODE_ENV> are loaded early (e.g., .env.test in E2E)
import '$lib/server/conf/server.config';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { getAuthForRequest } from '$lib/server/infra/auth';

// Auth handler: reads session from Better Auth and exposes to locals
const authHandler: Handle = async ({ event, resolve }) => {
	const auth = getAuthForRequest(event.request);

	// Fetch current session (user + session) using request headers
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Let Better Auth wire its SvelteKit hooks (cookies, redirects, etc.)
	return svelteKitHandler({ event, resolve, auth, building });
};

// Paraglide i18n handler to keep %paraglide.lang% in sync
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Compose: Paraglide first, then Auth
export const handle: Handle = sequence(handleParaglide, authHandler);
