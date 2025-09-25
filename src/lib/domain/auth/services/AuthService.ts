import type { Surreal } from 'surrealdb';

// Thin placeholder for future auth-specific helpers (e.g., password reset, linking providers)
// Follows DI pattern so it can be injected alongside other services
export class AuthService {
  constructor(private readonly getDb: () => Promise<Surreal>) {}

  // Example placeholder method to satisfy structure; real auth flows use Better Auth routes
  async ping(): Promise<'ok'> {
    // Touch DB to guarantee DI works if needed later
    await this.getDb();
    return 'ok';
  }
}

