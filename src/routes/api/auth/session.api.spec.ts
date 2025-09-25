import { describe, it, expect } from 'vitest';

const E2E = process.env.E2E === 'true';

(E2E ? describe : describe.skip)('API: /api/auth/session', () => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  it('returns a response (status code check)', async () => {
    const res = await fetch(base + '/api/auth/session');
    // Depending on better-auth config, unauthenticated may be 200 (empty) or 401
    expect([200, 401]).toContain(res.status);
  });
});

