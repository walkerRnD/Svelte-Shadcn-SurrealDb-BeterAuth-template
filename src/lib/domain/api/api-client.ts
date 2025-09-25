import { createAuthClient } from "better-auth/svelte";

// Allow overriding the target app origin in tests via VITE_APP_ORIGIN
const APP_ORIGIN = (typeof window !== 'undefined')
  ? ((import.meta as any)?.env?.VITE_APP_ORIGIN || window.location.origin)
  : (process.env.VITE_APP_ORIGIN || 'http://localhost:5173');

// Create the auth client with proper configuration
export const authClient = createAuthClient({
  baseURL: APP_ORIGIN,
});

// Export individual methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  changePassword,
  deleteUser,
  forgetPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail
} = authClient;

// Legacy export for backward compatibility
export const apiClient = authClient;