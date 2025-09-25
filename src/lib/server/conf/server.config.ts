import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load .env and overlay with .env.<NODE_ENV> if present (e.g., .env.test for E2E)
const NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config();
const envFile = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

export const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
};

const DEFAULT_DB_HOST = (() => {
  if (NODE_ENV === 'test') return 'mem://test.db';
  return 'surrealkv://data.db';
})();

export const DB_CONFIG = {
  host: process.env.DB_HOST || DEFAULT_DB_HOST,
  namespace: process.env.DB_NAMESPACE || 'local',
  database: process.env.DB_DATABASE || 'persisted',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  // token: process.env.DB_TOKEN,
};
