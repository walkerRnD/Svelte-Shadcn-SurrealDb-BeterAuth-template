import { betterAuth } from "better-auth";
import { surrealAdapter } from "$lib/domain/auth/adapters/better-auth.adapter";
import { emailService } from "./email";
import { loadEmailMessages, getResetPasswordMessages } from "../email-templates/i18n-loader";

function buildAuth(baseURL: string) {
  const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
  if (!BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
  }
  const trustedOrigins = Array.from(new Set([
    baseURL,
    process.env.BETTER_AUTH_URL,
    `${baseURL}/api/auth`,
  ].filter((x): x is string => typeof x === 'string' && x.length > 0)));

  const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true when email service is configured
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      sendResetPassword: async ({ user, url, token }) => {
        try {
          // Load i18n messages (default to 'en', can be extended to detect user locale)
          const emailMessages = await loadEmailMessages('en');
          const messages = getResetPasswordMessages(emailMessages);

          const result = await emailService.sendPasswordReset(user.email, {
            userName: user.name,
            resetUrl: url,
            expiresInHours: 1,
            messages,
          });

          if (result.error) {
            console.error(`❌ Failed to send reset email to ${user.email}:`, result.error);
            // Don't throw - Better Auth will handle the error gracefully
          } else {
            console.log(`✅ Password reset email sent to ${user.email} (ID: ${result.id})`);
          }
        } catch (e: any) {
          console.error(`❌ Error sending reset email to ${user.email}:`, e);
        }
      },
      resetPasswordTokenExpiresIn: 3600, // 1 hour
    },

    database: surrealAdapter,

    // User management
    user: {
      deleteUser: {
        enabled: true,
      },
    },

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
