import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import { ReceiptItemCategory } from "@prisma/client";
import type { ReceiptExtractionService } from "./features/receipt-extractions/service.js";
import type { ReceiptService } from "./features/receipts/service.js";
import type { ConfirmReceiptInput } from "./features/receipts/types.js";

export interface UploadRoutesOptions {
  receiptExtractionService: ReceiptExtractionService;
  receiptService: ReceiptService;
  uploadsDir: string;
}

export async function registerUploadRoutes(
  app: FastifyInstance,
  { receiptExtractionService, receiptService, uploadsDir }: UploadRoutesOptions,
): Promise<void> {
  await mkdir(uploadsDir, { recursive: true });

  await app.register(multipart, {
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 1,
    },
  });

  app.post("/receipts", async (request, reply) => {
    const file = await request.file();

    if (!file) {
      return reply.code(400).send({ error: "receipt_file_required" });
    }

    if (file.fieldname !== "receipt") {
      await file.file.resume();
      return reply.code(400).send({ error: "invalid_file_field" });
    }

    if (!file.mimetype.startsWith("image/")) {
      await file.file.resume();
      return reply.code(415).send({ error: "unsupported_media_type" });
    }

    const originalFilename = basename(file.filename || "receipt.jpg");
    const extension = extname(originalFilename) || ".jpg";
    const storedFilename = `${randomUUID()}${extension}`;
    const storedPath = join(uploadsDir, storedFilename);

    let imageSizeBytes = 0;
    file.file.on("data", (chunk: Buffer) => {
      imageSizeBytes += chunk.length;
    });

    await pipeline(file.file, createWriteStream(storedPath));

    const receiptExtraction = await receiptExtractionService.createUploadFallbackExtraction({
      tempImagePath: storedPath,
      imageOriginalFilename: originalFilename,
      imageMimeType: file.mimetype,
      imageSizeBytes,
    });

    return reply.code(201).send({
      receiptExtraction,
      extractionStatus: "failed",
    });
  });

  app.post("/receipts/confirm", async (request, reply) => {
    try {
      const input = parseConfirmReceiptBody(request.body);
      const receipt = await receiptService.confirmReceipt(input);

      return reply.code(201).send({ receipt });
    } catch (error) {
      const message = error instanceof Error ? error.message : "receipt_confirm_failed";
      const publicBadRequestErrors = new Set([
        "invalid_request_body",
        "market_name_required",
        "invalid_purchase_date",
        "invalid_official_total_amount_cents",
        "image_path_required",
        "receipt_items_required",
        "invalid_receipt_item",
        "item_original_name_required",
        "invalid_item_total_amount_cents",
        "invalid_item_category",
        "invalid_string",
        "invalid_integer",
        "invalid_quantity",
      ]);

      if (message === "receipt_extraction_not_found") {
        return reply.code(404).send({ error: message });
      }

      if (message === "receipt_extraction_not_completed") {
        return reply.code(409).send({ error: message });
      }

      if (publicBadRequestErrors.has(message)) {
        return reply.code(400).send({ error: message });
      }

      request.log.error(error);
      return reply.code(400).send({ error: "receipt_confirm_failed" });
    }
  });
}

function parseConfirmReceiptBody(body: unknown): ConfirmReceiptInput {
  if (!isRecord(body)) {
    throw new Error("invalid_request_body");
  }

  const items = Array.isArray(body.items) ? body.items : [];

  return {
    extractionId: getOptionalString(body.extractionId),
    marketName: getRequiredString(body.marketName),
    purchaseDate: getRequiredString(body.purchaseDate),
    officialTotalAmountCents: getRequiredInteger(body.officialTotalAmountCents),
    imagePath: getRequiredString(body.imagePath),
    items: items.map((item) => {
      if (!isRecord(item)) {
        throw new Error("invalid_receipt_item");
      }

      return {
        originalName: getRequiredString(item.originalName),
        quantity: getOptionalQuantity(item.quantity),
        unit: getOptionalString(item.unit),
        unitPriceAmountCents: getOptionalInteger(item.unitPriceAmountCents),
        totalAmountCents: getRequiredInteger(item.totalAmountCents),
        category: parseReceiptItemCategory(item.category),
      };
    }),
  };
}

function parseReceiptItemCategory(value: unknown): ReceiptItemCategory {
  if (typeof value !== "string") {
    throw new Error("invalid_item_category");
  }

  if (value in ReceiptItemCategory) {
    return ReceiptItemCategory[value as keyof typeof ReceiptItemCategory];
  }

  const category = Object.values(ReceiptItemCategory).find((itemCategory) => itemCategory === value);

  if (!category) {
    throw new Error("invalid_item_category");
  }

  return category;
}

function getRequiredString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("invalid_string");
  }

  return value;
}

function getOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return getRequiredString(value);
}

function getRequiredInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error("invalid_integer");
  }

  return value;
}

function getOptionalInteger(value: unknown): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  return getRequiredInteger(value);
}

function getOptionalQuantity(value: unknown): string | number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  throw new Error("invalid_quantity");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
