import Fastify, { type FastifyInstance } from "fastify";
import { pathToFileURL } from "node:url";
import { getBackendConfig } from "./app/config.js";
import { ReceiptExtractionRepository } from "./features/receipt-extractions/repository.js";
import { ReceiptExtractionService } from "./features/receipt-extractions/service.js";
import { ReceiptService } from "./features/receipts/service.js";
import { createPrismaClient, type AppPrismaClient } from "./shared/database/prisma.js";
import { registerUploadRoutes } from "./uploads.js";

export interface BuildAppOptions {
  openaiApiKey?: string;
  openaiReceiptExtractionModel?: string;
  prisma?: AppPrismaClient;
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

  if (options.prisma && options.uploadsDir) {
    const receiptExtractionRepository = new ReceiptExtractionRepository(options.prisma);
    const receiptExtractionService = new ReceiptExtractionService(receiptExtractionRepository, {
      apiKey: options.openaiApiKey,
      model: options.openaiReceiptExtractionModel ?? "gpt-5-mini",
    });
    const receiptService = new ReceiptService(options.prisma);

    await registerUploadRoutes(app, {
      receiptExtractionService,
      receiptService,
      uploadsDir: options.uploadsDir,
    });
  }

  return app;
}

export async function startServer(): Promise<void> {
  const { databaseUrl, host, openaiApiKey, openaiReceiptExtractionModel, port, uploadsDir } =
    getBackendConfig();
  const prisma = createPrismaClient(databaseUrl);

  const app = await buildApp({
    openaiApiKey,
    openaiReceiptExtractionModel,
    prisma,
    uploadsDir,
  });
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  try {
    await prisma.$connect();
    await app.listen({ host, port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await startServer();
}
