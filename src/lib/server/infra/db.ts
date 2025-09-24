import { Surreal } from "surrealdb";
import { DB_CONFIG } from "../conf/server.config.js";
import { surrealdbNodeEngines } from "@surrealdb/node";
import { INIT_DB_QUERY } from "./init-db.query.js";

export interface SERVER_DB_CONF {
  host: string;
  namespace?: string;
  database?: string;
  username?: string;
  password?: string;
  token?: string;
}
let db: Surreal | undefined;
let isConnecting = false;
let connectionPromise: Promise<Surreal> | null = null;
export async function getDb(): Promise<Surreal> {
  if (db) {
    try {
      await db.query("SELECT * FROM user LIMIT 1");
      return db;
    } catch (error) {
      db = await createDbConnection(DB_CONFIG);
      return db;
    }
  }

  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      db = await createDbConnection(DB_CONFIG);
      resolve(db);
    }
    catch (error) {
      reject(error);
    }
    finally {
      isConnecting = false;
      connectionPromise = null;
    }
  });
  return connectionPromise;
}
export async function closeDashboardDb(): Promise<void> {
  if (!db) return;
  await db.close();
  db = undefined;
}

export const createDbConnection = async (conf: SERVER_DB_CONF) => {
  const { host, namespace, database, username, password, token } = conf;
  const isEmbedded = host.startsWith("mem://") || host.startsWith("surrealkv://");
  const db = new Surreal(isEmbedded ? { engines: surrealdbNodeEngines() } : undefined);
  await db.connect(host, {
    namespace: namespace,
    database: database,
    // auth: {
    //   username: username,
    //   password: password,
    // }
  });
  if (isEmbedded) {
    await db.query(INIT_DB_QUERY);
    return db;
  };
  if (conf.token) {
    await db.authenticate(conf.token);
    return db;
  }
  if (!username || !password) {
    throw new Error("Username and password are required for non-embedded databases");
  }
  await db.signin({
    username,
    password,
  });
  await db.query(INIT_DB_QUERY);
  return db;
};
