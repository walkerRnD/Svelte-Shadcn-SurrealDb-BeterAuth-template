import { describe, it, expect } from 'vitest';

const E2E = process.env.E2E === 'true';

(E2E ? describe : describe.skip)('API: /api/auth/provider/list', () => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  it('guards or returns providers for the current user', async () => {
    const res = await fetch(base + '/api/auth/provider/list');
    // When unauthenticated, expect 401. If a session exists in the test env, it may be 200.
    expect([200, 401]).toContain(res.status);
  });
});

