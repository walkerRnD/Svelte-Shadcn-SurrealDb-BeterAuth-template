import { betterAuth } from "better-auth";
import { surrealAdapter } from "../../shared-utils/auth/better-auth.adapter";

// console.log({
//   address: SERVER_CONFIG.db.host,
//   username: SERVER_CONFIG.db.username as string,
//   password: SERVER_CONFIG.db.password as string,
//   ns: SERVER_CONFIG.db.namespace,
//   db: SERVER_CONFIG.db.database,
// })

export function getAuth() {
  const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
  const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:5173";
  if (!BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
  }
  const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    baseURL: BETTER_AUTH_URL,

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