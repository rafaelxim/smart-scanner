import Fastify, { type FastifyInstance } from "fastify";
import { pathToFileURL } from "node:url";

export interface BackendConfig {
  host: string;
  port: number;
}

export function getBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  return {
    host: env.BACKEND_HOST ?? "0.0.0.0",
    port: Number(env.BACKEND_PORT ?? "3000"),
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
  const app = buildApp();
  const { host, port } = getBackendConfig();

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
