import type { Adapter, BetterAuthOptions } from "better-auth/types";
import { getDb } from "../../server/infra/db";
import { BetterAuthService } from "./better-auth.service";

export const surrealAdapter = (options: BetterAuthOptions): Adapter => {
  return new BetterAuthService(getDb, options);
};
