import type { RequestHandler } from '@sveltejs/kit';
import { getAuthForRequest } from '$lib/server/infra/auth';

// Mount Better Auth handler on /api/auth/* with dynamic origin
export const GET: RequestHandler = async ({ request }) => {
  const res = await getAuthForRequest(request).handler(request);
  return res as Response;
};

export const POST: RequestHandler = async ({ request }) => {
  const res = await getAuthForRequest(request).handler(request);
  return res as Response;
};

export const OPTIONS: RequestHandler = async ({ request }) => {
  const res = await getAuthForRequest(request).handler(request);
  return res as Response;
};

