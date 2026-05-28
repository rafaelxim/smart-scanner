export interface BackendConfig {
  databaseUrl: string;
  host: string;
  openaiApiKey?: string;
  openaiReceiptExtractionModel: string;
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
    openaiApiKey: normalizeOptionalEnv(env.OPENAI_API_KEY),
    openaiReceiptExtractionModel:
      normalizeOptionalEnv(env.OPENAI_RECEIPT_EXTRACTION_MODEL) ?? "gpt-5-mini",
    port: Number(env.BACKEND_PORT ?? "3000"),
    uploadsDir: env.UPLOADS_DIR ?? "uploads",
  };
}

function normalizeOptionalEnv(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
