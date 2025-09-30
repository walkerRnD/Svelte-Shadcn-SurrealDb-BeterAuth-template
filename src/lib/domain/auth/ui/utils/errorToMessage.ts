import { m } from "$lib/paraglide/messages.js";

export type ErrorContext =
  | "login"
  | "create"
  | "resetStart" // forgetPassword
  | "reset"      // resetPassword
  | "devLogin";

function asString(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  const anyErr: any = err as any;
  return anyErr?.message || anyErr?.error?.message || "";
}

export function errorToMessage(ctx: ErrorContext, err: unknown): string {
  const raw = asString(err).toLowerCase();
  const status = (err as any)?.status as number | undefined;
  const code = (err as any)?.code as string | undefined;

  // Common heuristics
  const isUnauthorized = status === 401 || /unauthorized|invalid/.test(raw);
  const isConflict = status === 409 || /exists|already/.test(raw);
  const isBadRequest = status === 400;

  switch (ctx) {
    case "login": {
      // Differentiate invalid credentials vs system errors
      const isServerError = typeof status === "number" && status >= 500;
      if (isUnauthorized || code === "INVALID_CREDENTIALS" || /invalid credentials|wrong password|invalid email|invalid password/.test(raw)) {
        return m.login_error_invalid_credentials();
      }
      if (isServerError || /network|failed to fetch|timeout|internal|server error/.test(raw)) {
        return m.login_error_system();
      }
      return m.login_error_sign_in_failed();
    }
    case "create": {
      // Differentiate: user exists vs system error vs generic failure
      const serverError = typeof status === "number" && status >= 500;
      const userExistsByCode = code === "USER_EXISTS" || code === "EMAIL_IN_USE";
      const userExistsByMsg = /already|exists|in use/.test(raw);
      if (isConflict || userExistsByCode || userExistsByMsg) {
        return m.create_error_user_exists();
      }
      if (serverError || /network|failed to fetch|timeout|internal|server error/.test(raw)) {
        return m.create_error_system();
      }
      return m.create_error_failed();
    }
    case "resetStart": {
      // Start reset (send link)
      if (isBadRequest || isUnauthorized) return m.reset_error_start_failed();
      return m.reset_error_start_failed();
    }
    case "reset": {
      // Final reset (with token)
      return m.reset_error_failed();
    }
    case "devLogin": {
      return m.login_error_dev_login_failed();
    }
    default:
      return raw || m.login_error_sign_in_failed();
  }
}

