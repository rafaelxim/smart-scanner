import Fastify, { type FastifyInstance } from "fastify";
import { pathToFileURL } from "node:url";
import { initializeDatabase, openDatabase } from "./database.js";

export interface BackendConfig {
  host: string;
  port: number;
  sqliteDbPath: string;
}

export function getBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  return {
    host: env.BACKEND_HOST ?? "0.0.0.0",
    port: Number(env.BACKEND_PORT ?? "3000"),
    sqliteDbPath: env.SQLITE_DB_PATH ?? "data/smart-scanner.sqlite",
  };
}

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "smart-scanner-backend",
  }));

  return app;
}

export async function startServer(): Promise<void> {
  const { host, port, sqliteDbPath } = getBackendConfig();
  const database = openDatabase(sqliteDbPath);
  initializeDatabase(database);

  const app = buildApp();
  app.addHook("onClose", async () => {
    database.close();
  });

  try {
    await app.listen({ host, port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await startServer();
}
