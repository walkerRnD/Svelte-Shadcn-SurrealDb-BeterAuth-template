import { betterAuth } from "better-auth";
import { surrealAdapter } from "$lib/domain/+shared/auth/better-auth.adapter";

function buildAuth(baseURL: string) {
  const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
  if (!BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
  }
  const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    baseURL,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true when email service is configured
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      sendResetPassword: async ({ user, url, token }) => {
        // TODO: Implement email sending service
        console.log(`Password reset requested for ${user.email}`);
        console.log(`Reset URL: ${url}`);
        console.log(`Token: ${token}`);
      },
      resetPasswordTokenExpiresIn: 3600, // 1 hour
    },

    database: surrealAdapter,

    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },

    // Security settings
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      cookiePrefix: "better-auth",
    },
  });

  return auth;
}

export function getAuth() {
  const fallback = process.env.BETTER_AUTH_URL || "http://localhost:5173";
  return buildAuth(fallback);
}

export function getAuthForRequest(request: Request) {
  const origin = new URL(request.url).origin;
  return buildAuth(origin);
}
