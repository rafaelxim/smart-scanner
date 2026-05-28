export interface BackendConfig {
  databaseUrl: string;
  host: string;
  port: number;
  uploadsDir: string;
}

export function getBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return {
    databaseUrl,
    host: env.BACKEND_HOST ?? "0.0.0.0",
    port: Number(env.BACKEND_PORT ?? "3000"),
    uploadsDir: env.UPLOADS_DIR ?? "uploads",
  };
}
