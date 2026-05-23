import Fastify, { type FastifyInstance } from "fastify";
import { pathToFileURL } from "node:url";
import { initializeDatabase, openDatabase } from "./database.js";
import { ReceiptRepository } from "./receipts.js";
import { registerUploadRoutes } from "./uploads.js";

export interface BackendConfig {
  host: string;
  port: number;
  sqliteDbPath: string;
  uploadsDir: string;
}

export function getBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  return {
    host: env.BACKEND_HOST ?? "0.0.0.0",
    port: Number(env.BACKEND_PORT ?? "3000"),
    sqliteDbPath: env.SQLITE_DB_PATH ?? "data/smart-scanner.sqlite",
    uploadsDir: env.UPLOADS_DIR ?? "uploads",
  };
}

export interface BuildAppOptions {
  receiptRepository?: ReceiptRepository;
  uploadsDir?: string;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "smart-scanner-backend",
  }));

  if (options.receiptRepository && options.uploadsDir) {
    await registerUploadRoutes(app, {
      receiptRepository: options.receiptRepository,
      uploadsDir: options.uploadsDir,
    });
  }

  return app;
}

export async function startServer(): Promise<void> {
  const { host, port, sqliteDbPath, uploadsDir } = getBackendConfig();
  const database = openDatabase(sqliteDbPath);
  initializeDatabase(database);
  const receiptRepository = new ReceiptRepository(database);

  const app = await buildApp({ receiptRepository, uploadsDir });
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
