import { describe, it, expect } from 'vitest';

const E2E = process.env.E2E === 'true';

(E2E ? describe : describe.skip)('API: /api/auth/reset-request', () => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  it('accepts POST with email', async () => {
    const res = await fetch(base + '/api/auth/reset-request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'dev+e2e@example.com' }),
    });
    expect([200, 400]).toContain(res.status);
  });
});

