import type { RequestHandler } from '@sveltejs/kit';
import { getAuth } from '$lib/server/infra/auth';

// Mount Better Auth handler on /api/auth/*
export const GET: RequestHandler = async ({ request }) => {
  const res = await getAuth().handler(request);
  return res as Response;
};

export const POST: RequestHandler = async ({ request }) => {
  const res = await getAuth().handler(request);
  return res as Response;
};

export const OPTIONS: RequestHandler = async ({ request }) => {
  const res = await getAuth().handler(request);
  return res as Response;
};

