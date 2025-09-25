import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Strict guard: require authenticated user for all /user/* routes
  if (!locals.user) {
    // Optional: preserve intended destination
    const next = encodeURIComponent(url.pathname + url.search);
    throw redirect(303, `/auth/login?next=${next}`);
  }
  // Optionally expose user to the client
  return { user: locals.user };
};

