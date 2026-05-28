import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { getBackendConfig } from "../app/config.js";
import { createPrismaClient } from "../shared/database/prisma.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(currentDir, "../../../../.env");

if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath });
}

interface CleanupResult {
  expiredExtractions: number;
  deletedRows: number;
  deletedFiles: number;
  missingFiles: number;
  failedFileDeletes: number;
}

async function main(): Promise<void> {
  const { databaseUrl } = getBackendConfig();
  const prisma = createPrismaClient(databaseUrl);

  try {
    const now = new Date();
    const expiredExtractions = await prisma.receiptExtraction.findMany({
      select: {
        id: true,
        tempImagePath: true,
      },
      where: {
        confirmedReceiptId: null,
        expiresAt: {
          lt: now,
        },
        status: {
          not: "CONFIRMED",
        },
      },
    });

    const result: CleanupResult = {
      expiredExtractions: expiredExtractions.length,
      deletedRows: 0,
      deletedFiles: 0,
      missingFiles: 0,
      failedFileDeletes: 0,
    };

    if (expiredExtractions.length > 0) {
      const deletedRows = await prisma.receiptExtraction.deleteMany({
        where: {
          id: {
            in: expiredExtractions.map((extraction) => extraction.id),
          },
        },
      });

      result.deletedRows = deletedRows.count;
    }

    for (const extraction of expiredExtractions) {
      try {
        await unlink(extraction.tempImagePath);
        result.deletedFiles += 1;
      } catch (error) {
        if (isMissingFileError(error)) {
          result.missingFiles += 1;
          continue;
        }

        result.failedFileDeletes += 1;
      }
    }

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

    if (result.failedFileDeletes > 0) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

function isMissingFileError(error: unknown): boolean {
  return isNodeError(error) && error.code === "ENOENT";
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack ?? error.message : "Cleanup failed."}\n`,
  );
  process.exitCode = 1;
});
